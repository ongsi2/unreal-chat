import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import { connectDB } from "./lib/db/mongodb";
import { redis, RedisCache } from "./lib/db/redis";
import { Message } from "./lib/models/Message";
import { ChatRoom } from "./lib/models/ChatRoom";

// 환경변수 로드
dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3333");

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // MongoDB 연결
  await connectDB();
  console.log("✅ MongoDB 연결 완료");

  // Redis 연결 확인
  await redis.ping();
  console.log("✅ Redis 연결 완료");

  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Socket.io 서버 초기화
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: `http://${hostname}:${port}`,
      methods: ["GET", "POST"],
    },
  });

  // 사용자 세션 관리 (userId -> socketId 매핑)
  const users = new Map<string, { userId: string; username: string; roomId?: string }>();
  const userSockets = new Map<string, string>(); // userId -> socketId 매핑

  io.on("connection", (socket) => {
    console.log("클라이언트 연결됨:", socket.id);

    // 사용자 로그인
    socket.on("user:login", async ({ userId, username }) => {
      users.set(socket.id, { userId, username });
      userSockets.set(userId, socket.id); // userId -> socketId 매핑 저장
      console.log(`✅ 사용자 로그인: ${username} (${userId}), socketId: ${socket.id}`);
      console.log(`📊 userSockets Map 크기: ${userSockets.size}, Map 내용:`, Array.from(userSockets.entries()));

      // Redis에 온라인 유저 추가
      await RedisCache.addOnlineUser(userId, { userId, username, socketId: socket.id });

      // 모든 클라이언트에게 온라인 사용자 목록 전송
      const onlineUsers = await RedisCache.getOnlineUsers();
      io.emit("users:online", onlineUsers);
    });

    // 채팅방 참가
    socket.on("room:join", async ({ roomId, userId, username }) => {
      const user = users.get(socket.id);
      if (user) {
        user.roomId = roomId;
        users.set(socket.id, user);
      }

      socket.join(roomId);
      console.log(`${username}님이 채팅방 ${roomId}에 입장했습니다`);

      // MongoDB 채팅방의 participants에 유저 추가 (중복 방지)
      try {
        await ChatRoom.findByIdAndUpdate(
          roomId,
          { $addToSet: { participants: userId } }
        );
        console.log(`📝 MongoDB participants 업데이트: userId=${userId}, roomId=${roomId}`);
      } catch (error) {
        console.error(`❌ MongoDB participants 업데이트 실패:`, error);
      }

      // Redis에 채팅방 유저 추가
      await RedisCache.addUserToRoom(roomId, userId, { userId, username, socketId: socket.id });

      // 채팅방 유저 수 가져오기
      const userCount = await RedisCache.getRoomUserCount(roomId);
      console.log(`👥 채팅방 ${roomId} 유저 수: ${userCount}명`);

      // 해당 채팅방의 모든 사용자들에게 업데이트된 유저 수 전송
      io.to(roomId).emit("room:user-count", { roomId, count: userCount });
      console.log(`📢 room:user-count 이벤트 전송: ${roomId}, ${userCount}명`);

      // 해당 채팅방의 다른 사용자들에게 알림
      socket.to(roomId).emit("user:joined", { userId, username });
    });

    // 채팅방 나가기
    socket.on("room:leave", async ({ roomId, userId, username }) => {
      socket.leave(roomId);
      console.log(`${username}님이 채팅방 ${roomId}에서 나갔습니다`);

      const user = users.get(socket.id);
      if (user) {
        user.roomId = undefined;
        users.set(socket.id, user);
      }

      // Redis에서 채팅방 유저 제거
      await RedisCache.removeUserFromRoom(roomId, userId);

      // 채팅방 유저 수 가져오기
      const userCount = await RedisCache.getRoomUserCount(roomId);

      // 해당 채팅방의 모든 사용자들에게 업데이트된 유저 수 전송
      io.to(roomId).emit("room:user-count", { roomId, count: userCount });

      // 해당 채팅방의 다른 사용자들에게 알림
      socket.to(roomId).emit("user:left", { userId, username });
    });

    // 메시지 전송
    socket.on("message:send", async (message) => {
      console.log("메시지 수신:", message);

      try {
        // MongoDB에 메시지 저장
        const newMessage = await Message.create({
          content: message.content,
          senderId: message.senderId,
          roomId: message.roomId,
          isRead: false,
          readBy: [],
        });

        // 채팅방의 lastMessageAt 업데이트
        const chatRoom = await ChatRoom.findByIdAndUpdate(
          message.roomId,
          { lastMessageAt: new Date() },
          { new: true }
        );

        const savedMessage = {
          ...message,
          id: newMessage._id.toString(),
          createdAt: newMessage.createdAt,
          readBy: [],
        };

        // Redis에 메시지 추가
        await RedisCache.addMessage(message.roomId, savedMessage);

        // 채팅방에 있지 않은 참여자들의 unread count 증가
        if (chatRoom) {
          const roomUsers = await RedisCache.getRoomUsers(message.roomId);
          const roomUserIds = roomUsers.map((u: any) => u.userId);
          console.log(`📊 현재 채팅방에 있는 유저: ${roomUserIds.join(", ")}`);
          console.log(`📊 채팅방 전체 참여자: ${chatRoom.participants.join(", ")}`);

          // 채팅방의 모든 참여자 중 현재 방에 없는 사람들의 unread count 증가
          for (const participantId of chatRoom.participants) {
            // 메시지 발신자가 아니고, 현재 방에 없는 경우
            if (participantId !== message.senderId && !roomUserIds.includes(participantId)) {
              await RedisCache.incrementUnreadCount(message.roomId, participantId);
              console.log(`🔔 unreadCount 증가: userId=${participantId}, roomId=${message.roomId}`);

              // 해당 유저의 소켓에 직접 unread count 증가 이벤트 전송
              const targetSocketId = userSockets.get(participantId);
              console.log(`🔍 targetSocketId 조회: userId=${participantId}, socketId=${targetSocketId}, userSockets.size=${userSockets.size}`);
              if (targetSocketId) {
                io.to(targetSocketId).emit("unread:increment", {
                  roomId: message.roomId
                });
                console.log(`📬 unread:increment 이벤트 전송: userId=${participantId}, socketId=${targetSocketId}, roomId=${message.roomId}`);
              } else {
                console.log(`⚠️ targetSocketId 없음: userId=${participantId}, userSockets Map:`, Array.from(userSockets.entries()));
              }
            }
          }
        }

        // 해당 채팅방의 모든 사용자에게 메시지 전송
        io.to(message.roomId).emit("message:receive", savedMessage);

        console.log("✅ 메시지 저장 및 전송 완료");
      } catch (error) {
        console.error("❌ 메시지 저장 실패:", error);
      }
    });

    // 타이핑 시작
    socket.on("typing:start", async ({ roomId, userId, username }) => {
      await RedisCache.setTyping(roomId, userId, username);
      socket.to(roomId).emit("user:typing", { userId, username });
    });

    // 타이핑 중지
    socket.on("typing:stop", async ({ roomId, userId }) => {
      await RedisCache.removeTyping(roomId, userId);
      socket.to(roomId).emit("user:stop-typing", { userId });
    });

    // 메시지 읽음 표시
    socket.on("message:read", async ({ messageId, roomId, userId }) => {
      try {
        // MongoDB에서 메시지 업데이트
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: userId },
        });

        // Redis 읽지 않은 메시지 수 초기화
        await RedisCache.resetUnreadCount(roomId, userId);

        console.log(`👁️ 읽음 처리 완료: messageId=${messageId}, userId=${userId}, roomId=${roomId}`);
      } catch (error) {
        console.error("❌ 메시지 읽음 처리 실패:", error);
      }
    });

    // 연결 해제
    socket.on("disconnect", async () => {
      const user = users.get(socket.id);
      if (user) {
        console.log(`사용자 연결 해제: ${user.username}`);

        // 채팅방에서 나간 것으로 처리
        if (user.roomId) {
          // Redis에서 채팅방 유저 제거
          await RedisCache.removeUserFromRoom(user.roomId, user.userId);

          // 채팅방 유저 수 가져오기
          const userCount = await RedisCache.getRoomUserCount(user.roomId);

          // 해당 채팅방의 모든 사용자들에게 업데이트된 유저 수 전송
          io.to(user.roomId).emit("room:user-count", { roomId: user.roomId, count: userCount });

          socket.to(user.roomId).emit("user:left", {
            userId: user.userId,
            username: user.username
          });
        }

        // Redis에서 온라인 유저 제거
        await RedisCache.removeOnlineUser(user.userId);

        // userSockets Map에서도 제거
        userSockets.delete(user.userId);

        users.delete(socket.id);

        // 모든 클라이언트에게 온라인 사용자 목록 업데이트
        const onlineUsers = await RedisCache.getOnlineUsers();
        io.emit("users:online", onlineUsers);
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.io server running`);
    });
});
