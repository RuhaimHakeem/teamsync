import { UserRole } from '@prisma/client';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  rememberMe?: boolean;
  jti?: string;
  iat?: number;
  exp?: number;
}
