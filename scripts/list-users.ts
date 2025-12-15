import dotenv from "dotenv";
import { connectDB } from "../lib/db/mongodb";
import { User } from "../lib/models/User";

dotenv.config();

async function listUsers() {
  try {
    console.log("🔄 데이터베이스 연결 중...");
    await connectDB();

    const users = await User.find({}, "username email").lean();

    console.log(`\n👥 전체 사용자 목록 (${users.length}명):\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ 사용자 조회 실패:", error);
    process.exit(1);
  }
}

listUsers();
