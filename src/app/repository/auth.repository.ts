import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseRepository } from './base.repository';
import { environment } from '../../environments/environment';
import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  LogoutRequestDto,
  UserDto
} from '../dto/auth/login.dto';
import {
  RegisterRequestDto,
  RegisterResponseDto
} from '../dto/auth/register.dto';

/**
 * Repositório para operações de autenticação
 */
@Injectable({
  providedIn: 'root'
})
export class AuthRepository extends BaseRepository<UserDto, RegisterRequestDto, any> {
  
  protected endpoint = 'auth';

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Realizar login
   */
  login(credentials: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Realizar registro
   */
  register(userData: RegisterRequestDto): Observable<RegisterResponseDto> {
    return this.http.post<RegisterResponseDto>(`${this.baseUrl}/auth/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Renovar token
   */
  refreshToken(refreshToken: string): Observable<LoginResponseDto> {
    const request: RefreshTokenRequestDto = { refreshToken };
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/auth/refresh`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Realizar logout
   */
  logout(refreshToken: string): Observable<void> {
    const request: LogoutRequestDto = { refreshToken };
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obter perfil do usuário atual
   */
  getCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/auth/me`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Alterar senha
   */
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Solicitar recuperação de senha
   */
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/forgot-password`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Resetar senha
   */
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/reset-password`, {
      token,
      newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Verificar se email está disponível
   */
  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.baseUrl}/auth/check-email?email=${email}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Verificar se username está disponível
   */
  checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.baseUrl}/auth/check-username?username=${username}`)
      .pipe(
        catchError(this.handleError)
      );
  }
} 