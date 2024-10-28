export interface User {
  id: string; // UUID is stored as string in TypeScript
  email: string;
  username: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
  last_login: string | null;
  email_verified: boolean;
}

export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  created_at: string;
}
