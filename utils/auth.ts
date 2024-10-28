import { hash, compare } from 'bcryptjs';
import { cookies } from 'next/headers';
import { SessionManager } from '../lib/redis';
import { JWTManager } from '../lib/jwt';

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await compare(password, hashedPassword);
};

export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function createUserSession(userId: string, lastPath: string) {
  const sessionId = await SessionManager.createSession(userId, lastPath);
  const token = JWTManager.sign(sessionId);
  
  // Set secure HTTP-only cookie
  cookies().set('sessionToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  
  return sessionId;
}

export async function logout() {
  const sessionToken = cookies().get('sessionToken')?.value;
  
  if (sessionToken) {
    const sessionId = JWTManager.verify(sessionToken);
    if (sessionId) {
      await SessionManager.deleteSession(sessionId);
    }
  }
  
  cookies().delete('sessionToken');
}
