import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisClient {
  private static instance: Redis | null = null;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      RedisClient.instance.on('connect', () => {
        console.log('✅ Redis 연결 성공');
      });

      RedisClient.instance.on('error', (err) => {
        console.error('❌ Redis 에러:', err);
      });
    }

    return RedisClient.instance;
  }

  static async disconnect() {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null;
      console.log('Redis 연결 종료');
    }
  }
}

export const redis = RedisClient.getInstance();

// Redis 캐싱 헬퍼 함수들
export class RedisCache {
  private static PREFIX = 'realchat:';

  // 최근 메시지 캐싱 (50개)
  static async cacheRecentMessages(roomId: string, messages: any[]) {
    const key = `${this.PREFIX}messages:${roomId}`;
    await redis.del(key);

    if (messages.length > 0) {
      const messageStrings = messages.map(msg => JSON.stringify(msg));
      await redis.lpush(key, ...messageStrings);
      await redis.ltrim(key, 0, 49); // 최근 50개만 유지
      await redis.expire(key, 3600); // 1시간 TTL
    }
  }

  // 최근 메시지 가져오기
  static async getRecentMessages(roomId: string): Promise<any[] | null> {
    const key = `${this.PREFIX}messages:${roomId}`;
    const messages = await redis.lrange(key, 0, -1);

    if (messages.length === 0) {
      return null;
    }

    return messages.map(msg => JSON.parse(msg)).reverse();
  }

  // 새 메시지 추가
  static async addMessage(roomId: string, message: any) {
    const key = `${this.PREFIX}messages:${roomId}`;
    await redis.lpush(key, JSON.stringify(message));
    await redis.ltrim(key, 0, 49);
    await redis.expire(key, 3600);
  }

  // 온라인 유저 추가
  static async addOnlineUser(userId: string, userData: any) {
    const key = `${this.PREFIX}users:online`;
    await redis.hset(key, userId, JSON.stringify(userData));
  }

  // 온라인 유저 제거
  static async removeOnlineUser(userId: string) {
    const key = `${this.PREFIX}users:online`;
    await redis.hdel(key, userId);
  }

  // 온라인 유저 목록 가져오기
  static async getOnlineUsers(): Promise<any[]> {
    const key = `${this.PREFIX}users:online`;
    const users = await redis.hgetall(key);

    return Object.values(users).map(user => JSON.parse(user));
  }

  // 읽지 않은 메시지 수 증가
  static async incrementUnreadCount(roomId: string, userId: string) {
    const key = `${this.PREFIX}unread:${userId}:${roomId}`;
    await redis.incr(key);
  }

  // 읽지 않은 메시지 수 초기화
  static async resetUnreadCount(roomId: string, userId: string) {
    const key = `${this.PREFIX}unread:${userId}:${roomId}`;
    await redis.del(key);
  }

  // 읽지 않은 메시지 수 가져오기
  static async getUnreadCount(roomId: string, userId: string): Promise<number> {
    const key = `${this.PREFIX}unread:${userId}:${roomId}`;
    const count = await redis.get(key);
    return count ? parseInt(count, 10) : 0;
  }

  // 타이핑 상태 설정 (5초 TTL)
  static async setTyping(roomId: string, userId: string, username: string) {
    const key = `${this.PREFIX}typing:${roomId}`;
    await redis.hset(key, userId, username);
    await redis.expire(key, 5);
  }

  // 타이핑 상태 제거
  static async removeTyping(roomId: string, userId: string) {
    const key = `${this.PREFIX}typing:${roomId}`;
    await redis.hdel(key, userId);
  }

  // 타이핑 중인 유저 가져오기
  static async getTypingUsers(roomId: string): Promise<string[]> {
    const key = `${this.PREFIX}typing:${roomId}`;
    const users = await redis.hgetall(key);
    return Object.values(users);
  }

  // 채팅방에 유저 추가
  static async addUserToRoom(roomId: string, userId: string, userData: any) {
    const key = `${this.PREFIX}room:${roomId}:users`;
    await redis.hset(key, userId, JSON.stringify(userData));
  }

  // 채팅방에서 유저 제거
  static async removeUserFromRoom(roomId: string, userId: string) {
    const key = `${this.PREFIX}room:${roomId}:users`;
    await redis.hdel(key, userId);
  }

  // 채팅방의 유저 목록 가져오기
  static async getRoomUsers(roomId: string): Promise<any[]> {
    const key = `${this.PREFIX}room:${roomId}:users`;
    const users = await redis.hgetall(key);
    return Object.values(users).map(user => JSON.parse(user));
  }

  // 채팅방의 유저 수 가져오기
  static async getRoomUserCount(roomId: string): Promise<number> {
    const key = `${this.PREFIX}room:${roomId}:users`;
    return await redis.hlen(key);
  }
}
