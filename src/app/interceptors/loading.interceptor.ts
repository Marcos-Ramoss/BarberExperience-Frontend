import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

/**
 * Interceptor para controle de loading global
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  private totalRequests = 0;

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.totalRequests++;
    this.showLoader();

    return next.handle(request).pipe(
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests === 0) {
          this.hideLoader();
        }
      })
    );
  }

  /**
   * Mostrar loader
   */
  private showLoader(): void {
    // Aqui você pode implementar a lógica para mostrar o loader
    // Por exemplo, usando um serviço de loading global
    console.log('Mostrando loader...');
    
    // Exemplo com PrimeNG ProgressSpinner
    // this.loadingService.show();
  }

  /**
   * Esconder loader
   */
  private hideLoader(): void {
    // Aqui você pode implementar a lógica para esconder o loader
    console.log('Escondendo loader...');
    
    // Exemplo com PrimeNG ProgressSpinner
    // this.loadingService.hide();
  }
} 