import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';

// Variáveis globais para controle de refresh
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

/**
 * Adicionar token ao header
 */
function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Obter token do localStorage
 */
function getToken(): string | null {
  return localStorage.getItem('access_token');
}

/**
 * Obter refresh token do localStorage
 */
function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

/**
 * Salvar tokens no localStorage
 */
function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

/**
 * Remover tokens do localStorage
 */
function removeTokens(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

/**
 * Renovar token
 */
function refreshToken(refreshToken: string): Observable<any> {
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

/**
 * Tratar erro 401 (Unauthorized)
 */
function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshTokenValue = getRefreshToken();
    
    if (refreshTokenValue) {
      return refreshToken(refreshTokenValue).pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(response.access_token);
          saveTokens(response.access_token, response.refresh_token);
          return next(addToken(request, response.access_token));
        }),
        catchError((error) => {
          isRefreshing = false;
          removeTokens();
          // Redirecionar para login
          window.location.href = '/auth/login';
          return throwError(() => error);
        })
      );
    } else {
      isRefreshing = false;
      removeTokens();
      // Redirecionar para login
      window.location.href = '/auth/login';
      return throwError(() => new Error('Token não encontrado'));
    }
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addToken(request, token)))
    );
  }
}

/**
 * Interceptor para adicionar token JWT nas requisições
 */
export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Adicionar token se existir
  const token = getToken();
  console.log('🔐 Auth Interceptor - Token encontrado:', !!token, 'URL:', request.url);
  
  if (token) {
    request = addToken(request, token);
    console.log('🔐 Auth Interceptor - Token adicionado ao header');
  } else {
    console.log('🔐 Auth Interceptor - Nenhum token encontrado');
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !request.url.includes('auth/refresh')) {
        return handle401Error(request, next);
      }
      return throwError(() => error);
    })
  );
}; 