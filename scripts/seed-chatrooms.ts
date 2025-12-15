import dotenv from "dotenv";
import { connectDB } from "../lib/db/mongodb";
import { ChatRoom } from "../lib/models/ChatRoom";
import { User } from "../lib/models/User";

dotenv.config();

async function seedChatRooms() {
  try {
    console.log("🔄 데이터베이스 연결 중...");
    await connectDB();

    // 모든 사용자 가져오기
    const allUsers = await User.find({}, "_id username").lean();

    if (allUsers.length === 0) {
      console.log("❌ 사용자가 없습니다. 먼저 회원가입을 해주세요.");
      process.exit(1);
    }

    console.log(`👥 전체 사용자: ${allUsers.length}명`);

    // 모든 사용자를 participants에 추가 (공개 채팅방)
    const allUserIds = allUsers.map((user) => user._id.toString());

    const chatRooms = [
      {
        name: "자유 수다방 💬",
        participants: allUserIds,
        isActive: true,
      },
      {
        name: "개발자 모임 💻",
        participants: allUserIds,
        isActive: true,
      },
      {
        name: "취미 공유방 🎨",
        participants: allUserIds,
        isActive: true,
      },
      {
        name: "맛집 추천 🍕",
        participants: allUserIds,
        isActive: true,
      },
    ];

    console.log("\n📝 채팅방 생성 중...");
    for (const room of chatRooms) {
      const created = await ChatRoom.create(room);
      console.log(`  ✅ ${room.name} (ID: ${created._id}, 참여자: ${room.participants.length}명)`);
    }

    console.log("\n✨ 채팅방 생성 완료!");
    console.log(`💡 총 ${chatRooms.length}개의 채팅방이 생성되었습니다.`);
    console.log(`💡 모든 채팅방에 ${allUserIds.length}명의 사용자가 자동 참여되었습니다.`);

    process.exit(0);
  } catch (error) {
    console.error("❌ 채팅방 생성 실패:", error);
    process.exit(1);
  }
}

seedChatRooms();
