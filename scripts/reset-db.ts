import dotenv from "dotenv";
import { connectDB } from "../lib/db/mongodb";
import { ChatRoom } from "../lib/models/ChatRoom";
import { Message } from "../lib/models/Message";
import { User } from "../lib/models/User";

dotenv.config();

async function resetDatabase() {
  try {
    console.log("🔄 데이터베이스 연결 중...");
    await connectDB();

    console.log("🗑️  메시지 삭제 중...");
    const messagesDeleted = await Message.deleteMany({});
    console.log(`✅ ${messagesDeleted.deletedCount}개의 메시지 삭제 완료`);

    console.log("🗑️  채팅방 삭제 중...");
    const chatRoomsDeleted = await ChatRoom.deleteMany({});
    console.log(`✅ ${chatRoomsDeleted.deletedCount}개의 채팅방 삭제 완료`);

    console.log("🗑️  사용자 삭제 중...");
    const usersDeleted = await User.deleteMany({});
    console.log(`✅ ${usersDeleted.deletedCount}명의 사용자 삭제 완료`);

    console.log("\n✨ 데이터베이스 완전 초기화 완료!");
    console.log("💡 이제 회원가입부터 다시 시작하세요.");

    process.exit(0);
  } catch (error) {
    console.error("❌ 데이터베이스 초기화 실패:", error);
    process.exit(1);
  }
}

resetDatabase();
