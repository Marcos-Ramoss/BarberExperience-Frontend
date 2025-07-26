import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

// Serviço global para controle de loading
let activeRequests = 0;
const loadingSubject = new BehaviorSubject<boolean>(false);

/**
 * Serviço para controle de loading global
 */
export class LoadingService {
  static get loading$() {
    return loadingSubject.asObservable();
  }

  static setLoading(loading: boolean) {
    loadingSubject.next(loading);
  }

  static incrementRequests() {
    activeRequests++;
    if (activeRequests === 1) {
      this.setLoading(true);
    }
  }

  static decrementRequests() {
    activeRequests--;
    if (activeRequests === 0) {
      this.setLoading(false);
    }
  }
}

/**
 * Interceptor para controle de loading global
 */
export const loadingInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Incrementar contador de requisições ativas
  LoadingService.incrementRequests();

  return next(request).pipe(
    finalize(() => {
      // Decrementar contador quando a requisição terminar
      LoadingService.decrementRequests();
    })
  );
}; 