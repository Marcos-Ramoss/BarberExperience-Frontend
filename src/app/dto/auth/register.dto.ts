import { UserRole } from './login.dto';

/**
 * DTO de requisição de registro
 */
export interface RegisterRequestDto {
  username: string;
  password: string;
  email: string;
  role: UserRole;
  name?: string;
}

/**
 * DTO de resposta de registro
 */
export interface RegisterResponseDto {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  name?: string;
  active: boolean;
  createdAt: string;
}

/**
 * DTO de validação de email
 */
export interface EmailValidationDto {
  email: string;
}

/**
 * DTO de validação de username
 */
export interface UsernameValidationDto {
  username: string;
}

/**
 * DTO de alteração de senha
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * DTO de recuperação de senha
 */
export interface ForgotPasswordDto {
  email: string;
}

/**
 * DTO de reset de senha
 */
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
} 