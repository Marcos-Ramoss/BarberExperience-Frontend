import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  PaginatedResponse
} from '../dto/shared/response.dto';
import { 
  PaginationRequest
} from '../dto/shared/pagination.dto';

/**
 * Classe base para repositórios
 * Implementa operações CRUD básicas
 */
@Injectable({
  providedIn: 'root'
})
export abstract class BaseRepository<T, CreateDto, UpdateDto> {
  
  protected abstract endpoint: string;
  protected baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  /**
   * Buscar todos os registros
   */
  findAll(pagination?: PaginationRequest): Observable<PaginatedResponse<T>> {
    let params = new HttpParams();
    
    if (pagination) {
      if (pagination.page !== undefined) {
        params = params.set('page', pagination.page.toString());
      }
      if (pagination.size !== undefined) {
        params = params.set('size', pagination.size.toString());
      }
      if (pagination.sort) {
        params = params.set('sort', pagination.sort);
      }
      if (pagination.direction) {
        params = params.set('direction', pagination.direction);
      }
    }

    return this.http.get<PaginatedResponse<T>>(`${this.baseUrl}/${this.endpoint}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Buscar por ID
   */
  findById(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${this.endpoint}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Criar novo registro
   */
  create(data: CreateDto): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${this.endpoint}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Atualizar registro
   */
  update(id: number, data: UpdateDto): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${this.endpoint}/${id}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Excluir registro
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Buscar com filtros customizados
   */
  findByFilters(filters: any, pagination?: PaginationRequest): Observable<PaginatedResponse<T>> {
    let params = new HttpParams();
    
    // Adicionar filtros
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key].toString());
      }
    });

    // Adicionar paginação
    if (pagination) {
      if (pagination.page !== undefined) {
        params = params.set('page', pagination.page.toString());
      }
      if (pagination.size !== undefined) {
        params = params.set('size', pagination.size.toString());
      }
      if (pagination.sort) {
        params = params.set('sort', pagination.sort);
      }
      if (pagination.direction) {
        params = params.set('direction', pagination.direction);
      }
    }

    return this.http.get<PaginatedResponse<T>>(`${this.baseUrl}/${this.endpoint}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Buscar todos sem paginação
   */
  findAllSimple(): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${this.endpoint}/all`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Verificar se existe
   */
  exists(id: number): Observable<boolean> {
    return this.http.head(`${this.baseUrl}/${this.endpoint}/${id}`)
      .pipe(
        map(() => true),
        catchError(() => [false])
      );
  }

  /**
   * Contar registros
   */
  count(filters?: any): Observable<number> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params = params.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get<{ count: number }>(`${this.baseUrl}/${this.endpoint}/count`, { params })
      .pipe(
        map(response => response.count),
        catchError(this.handleError)
      );
  }

  /**
   * Tratamento de erro centralizado
   */
  protected handleError(error: any): Observable<never> {
    let errorMessage = 'Ocorreu um erro inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor';
      } else if (error.status === 401) {
        errorMessage = 'Não autorizado. Faça login novamente.';
      } else if (error.status === 403) {
        errorMessage = 'Acesso negado';
      } else if (error.status === 404) {
        errorMessage = 'Recurso não encontrado';
      } else if (error.status === 422) {
        errorMessage = 'Dados inválidos';
      } else if (error.status >= 500) {
        errorMessage = 'Erro interno do servidor';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Erro na requisição:', error);
    return throwError(() => new Error(errorMessage));
  }
} 