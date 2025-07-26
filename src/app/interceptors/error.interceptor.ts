import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Interceptor para tratamento centralizado de erros
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocorreu um erro inesperado';

        if (error.error instanceof ErrorEvent) {
          // Erro do cliente
          errorMessage = `Erro: ${error.error.message}`;
        } else {
          // Erro do servidor
          switch (error.status) {
            case 0:
              errorMessage = 'Não foi possível conectar ao servidor';
              break;
            case 400:
              errorMessage = this.handle400Error(error);
              break;
            case 401:
              errorMessage = 'Não autorizado. Faça login novamente.';
              break;
            case 403:
              errorMessage = 'Acesso negado';
              break;
            case 404:
              errorMessage = 'Recurso não encontrado';
              break;
            case 409:
              errorMessage = 'Conflito de dados';
              break;
            case 422:
              errorMessage = this.handle422Error(error);
              break;
            case 429:
              errorMessage = 'Muitas requisições. Tente novamente em alguns minutos.';
              break;
            case 500:
              errorMessage = 'Erro interno do servidor';
              break;
            case 502:
              errorMessage = 'Servidor temporariamente indisponível';
              break;
            case 503:
              errorMessage = 'Serviço temporariamente indisponível';
              break;
            case 504:
              errorMessage = 'Timeout do servidor';
              break;
            default:
              if (error.error?.message) {
                errorMessage = error.error.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              break;
          }
        }

        // Log do erro para debugging
        console.error('Erro na requisição:', {
          url: request.url,
          method: request.method,
          status: error.status,
          message: errorMessage,
          error: error
        });

        // Aqui você pode adicionar notificações toast ou outros tratamentos
        this.showErrorNotification(errorMessage);

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Tratar erro 400 (Bad Request)
   */
  private handle400Error(error: HttpErrorResponse): string {
    if (error.error?.errors) {
      const errors = error.error.errors;
      if (Array.isArray(errors)) {
        return errors.map((e: any) => e.message || e).join(', ');
      }
    }
    return error.error?.message || 'Dados inválidos';
  }

  /**
   * Tratar erro 422 (Unprocessable Entity)
   */
  private handle422Error(error: HttpErrorResponse): string {
    if (error.error?.validationErrors) {
      const validationErrors = error.error.validationErrors;
      if (Array.isArray(validationErrors)) {
        return validationErrors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
      }
    }
    return error.error?.message || 'Dados inválidos';
  }

  /**
   * Mostrar notificação de erro
   */
  private showErrorNotification(message: string): void {
    // Aqui você pode implementar notificações toast
    // Por exemplo, usando PrimeNG Toast ou outro serviço
    console.error('Erro:', message);
    
    // Exemplo com alert (temporário)
    // alert(message);
  }
} 