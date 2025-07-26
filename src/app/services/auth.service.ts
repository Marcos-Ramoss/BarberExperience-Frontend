import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthRepository } from '../repository/auth.repository';
import {
  LoginRequestDto,
  LoginResponseDto,
  UserDto,
  UserRole
} from '../dto/auth/login.dto';
import {
  RegisterRequestDto,
  RegisterResponseDto
} from '../dto/auth/register.dto';

/**
 * Serviço de autenticação
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<UserDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(
    private authRepository: AuthRepository,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  /**
   * Realizar login
   */
  login(credentials: LoginRequestDto): Observable<LoginResponseDto | null> {
    this.setLoading(true);
    this.clearError();

    return this.authRepository.login(credentials).pipe(
      tap(response => {
        this.handleLoginSuccess(response);
      }),
      catchError(error => {
        this.setError(error.message);
        return of(null);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Realizar registro
   */
  register(userData: RegisterRequestDto): Observable<RegisterResponseDto | null> {
    this.setLoading(true);
    this.clearError();

    return this.authRepository.register(userData).pipe(
      tap(response => {
        this.handleRegisterSuccess(response);
      }),
      catchError(error => {
        this.setError(error.message);
        return of(null);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Realizar logout
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();
    
    if (refreshToken) {
      this.authRepository.logout(refreshToken).subscribe({
        next: () => this.handleLogout(),
        error: () => this.handleLogout()
      });
    } else {
      this.handleLogout();
    }
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser(): UserDto | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Verificar se tem role específica
   */
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Verificar se tem qualquer uma das roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return roles.includes(user?.role || UserRole.CLIENTE);
  }

  /**
   * Obter token de acesso
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Obter refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Renovar token
   */
  refreshToken(): Observable<LoginResponseDto | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.handleLogout();
      return of(null);
    }

    return this.authRepository.refreshToken(refreshToken).pipe(
      tap(response => {
        this.saveTokens(response.token, response.refreshToken);
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        this.handleLogout();
        return of(null);
      })
    );
  }

  /**
   * Alterar senha
   */
  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.authRepository.changePassword(currentPassword, newPassword).pipe(
      map(() => {
        this.setError('Senha alterada com sucesso!');
        return true;
      }),
      catchError(error => {
        this.setError(error.message);
        return of(false);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Solicitar recuperação de senha
   */
  forgotPassword(email: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.authRepository.forgotPassword(email).pipe(
      map(() => {
        this.setError('Email de recuperação enviado com sucesso!');
        return true;
      }),
      catchError(error => {
        this.setError(error.message);
        return of(false);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Resetar senha
   */
  resetPassword(token: string, newPassword: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.authRepository.resetPassword(token, newPassword).pipe(
      map(() => {
        this.setError('Senha redefinida com sucesso!');
        return true;
      }),
      catchError(error => {
        this.setError(error.message);
        return of(false);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Verificar disponibilidade de email
   */
  checkEmailAvailability(email: string): Observable<boolean> {
    return this.authRepository.checkEmailAvailability(email).pipe(
      map((response: { available: boolean }) => response.available),
      catchError(() => of(false))
    );
  }

  /**
   * Verificar disponibilidade de username
   */
  checkUsernameAvailability(username: string): Observable<boolean> {
    return this.authRepository.checkUsernameAvailability(username).pipe(
      map((response: { available: boolean }) => response.available),
      catchError(() => of(false))
    );
  }

  /**
   * Tratar sucesso do login
   */
  private handleLoginSuccess(response: LoginResponseDto): void {
    this.saveTokens(response.token, response.refreshToken);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
    this.router.navigate(['/dashboard']);
  }

  /**
   * Tratar sucesso do registro
   */
  private handleRegisterSuccess(response: RegisterResponseDto): void {
    this.setError('Usuário registrado com sucesso! Faça login para continuar.');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Tratar logout
   */
  private handleLogout(): void {
    this.removeTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verificar status de autenticação
   */
  private checkAuthStatus(): void {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();

    if (token && user) {
      this.isAuthenticatedSubject.next(true);
    } else {
      this.isAuthenticatedSubject.next(false);
    }
  }

  /**
   * Salvar tokens
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Remover tokens
   */
  private removeTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Definir loading
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Definir erro
   */
  private setError(error: string): void {
    this.errorSubject.next(error);
  }

  /**
   * Limpar erro
   */
  private clearError(): void {
    this.errorSubject.next(null);
  }
} 