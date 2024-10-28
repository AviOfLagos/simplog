import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const JWTManager = {
  sign(sessionId: string): string {
    return jwt.sign({ sessionId }, JWT_SECRET, { expiresIn: '7d' });
  },
  
  verify(token: string): string | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sessionId: string };
      return decoded.sessionId;
    } catch {
      return null;
    }
  }
};
