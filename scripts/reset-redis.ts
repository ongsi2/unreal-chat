import dotenv from "dotenv";
import { redis } from "../lib/db/redis";

dotenv.config();

async function resetRedis() {
  try {
    console.log("🔄 Redis 연결 중...");
    await redis.ping();
    console.log("✅ Redis 연결 성공");

    console.log("\n🗑️  Redis 데이터 삭제 중...");
    await redis.flushdb();
    console.log("✅ Redis 데이터 삭제 완료");

    console.log("\n✨ Redis 초기화 완료!");

    redis.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Redis 초기화 실패:", error);
    process.exit(1);
  }
}

resetRedis();
