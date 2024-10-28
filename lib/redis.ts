import Redis from 'ioredis';
import { Session } from '../types/session';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is not set');
}

const redis = new Redis(redisUrl);

export const SessionManager = {
  async createSession(userId: string, lastPath: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    const session: Session = {
      userId,
      lastPath,
      createdAt: Date.now(),
    };
    
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify(session),
      'EX',
      604800 // 7 days
    );
    
    return sessionId;
  },
  
  async getSession(sessionId: string): Promise<Session | null> {
    const session = await redis.get(`session:${sessionId}`);
    return session ? JSON.parse(session) : null;
  },
  
  async updateLastPath(sessionId: string, lastPath: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.lastPath = lastPath;
      await redis.set(
        `session:${sessionId}`,
        JSON.stringify(session),
        'EX',
        604800
      );
    }
  },
  
  async deleteSession(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`);
  }
};
