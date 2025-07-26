import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../dto/shared/response.dto';
import { PaginationRequest } from '../dto/shared/pagination.dto';

/**
 * Repository base abstrato com funcionalidades comuns
 */
@Injectable()
export abstract class BaseRepository<T, CreateDto, UpdateDto> {

  protected abstract endpoint: string;
  protected baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  /**
   * Obter headers de autenticação
   */
  protected getAuthHeaders(extra?: HttpHeaders): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) return extra || new HttpHeaders();
    
    if (!extra) {
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    } else {
      return extra.set('Authorization', `Bearer ${token}`);
    }
  }

  /**
   * Buscar todos com paginação
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

    return this.http.get<PaginatedResponse<T>>(
      `${this.baseUrl}/${this.endpoint}`, 
      { 
        params,
        headers: this.getAuthHeaders()
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Buscar por ID
   */
  findById(id: number): Observable<T> {
    return this.http.get<T>(
      `${this.baseUrl}/${this.endpoint}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Criar novo registro
   */
  create(data: CreateDto): Observable<T> {
    return this.http.post<T>(
      `${this.baseUrl}/${this.endpoint}`, 
      data,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Atualizar registro
   */
  update(id: number, data: UpdateDto): Observable<T> {
    return this.http.put<T>(
      `${this.baseUrl}/${this.endpoint}/${id}`, 
      data,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Excluir registro
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${this.endpoint}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
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

    return this.http.get<PaginatedResponse<T>>(
      `${this.baseUrl}/${this.endpoint}`, 
      { 
        params,
        headers: this.getAuthHeaders()
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Buscar todos sem paginação
   */
  findAllSimple(): Observable<T[]> {
    return this.http.get<T[]>(
      `${this.baseUrl}/${this.endpoint}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Verificar se existe
   * NOTA: Usando GET em vez de HEAD para compatibilidade
   */
  exists(id: number): Observable<boolean> {
    return this.http.get(
      `${this.baseUrl}/${this.endpoint}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Contar registros
   * NOTA: Endpoint /count pode não existir no backend
   */
  count(filters?: any): Observable<number> {
    // Por enquanto, vamos usar o endpoint principal e contar os resultados
    // TODO: Implementar endpoint /count quando disponível no backend
    return this.findAllSimple().pipe(
      map(items => items.length),
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