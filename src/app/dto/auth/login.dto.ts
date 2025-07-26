/**
 * DTO de requisição de login
 */
export interface LoginRequestDto {
  username: string;
  password: string;
}

/**
 * DTO de resposta de login
 */
export interface LoginResponseDto {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDto;
}

/**
 * DTO de usuário
 */
export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  name?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

/**
 * Enum de roles de usuário
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  BARBEARIA = 'BARBEARIA',
  PROFISSIONAL = 'PROFISSIONAL',
  CLIENTE = 'CLIENTE'
}

/**
 * DTO de refresh token
 */
export interface RefreshTokenRequestDto {
  refreshToken: string;
}

/**
 * DTO de logout
 */
export interface LogoutRequestDto {
  refreshToken: string;
} 