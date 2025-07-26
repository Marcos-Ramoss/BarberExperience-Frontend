import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';

/**
 * Interceptor para adicionar token JWT nas requisições
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Adicionar token se existir
    const token = this.getToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('auth/refresh')) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Adicionar token ao header
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Obter token do localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Obter refresh token do localStorage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Salvar tokens no localStorage
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Remover tokens do localStorage
   */
  private removeTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Tratar erro 401 (Unauthorized)
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        return this.refreshToken(refreshToken).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(response.access_token);
            this.saveTokens(response.access_token, response.refresh_token);
            return next.handle(this.addToken(request, response.access_token));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.removeTokens();
            // Redirecionar para login
            window.location.href = '/auth/login';
            return throwError(() => error);
          })
        );
      } else {
        this.isRefreshing = false;
        this.removeTokens();
        // Redirecionar para login
        window.location.href = '/auth/login';
        return throwError(() => new Error('Token não encontrado'));
      }
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(request, token)))
      );
    }
  }

  /**
   * Renovar token
   */
  private refreshToken(refreshToken: string): Observable<any> {
    // Aqui você implementaria a chamada para renovar o token
    // Por enquanto, vamos simular uma resposta
    return new Observable(observer => {
      // Simular chamada de API
      setTimeout(() => {
        observer.next({
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token'
        });
        observer.complete();
      }, 1000);
    });
  }
} 