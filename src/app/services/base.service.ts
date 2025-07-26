import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, finalize, map } from 'rxjs/operators';
import { BaseRepository } from '../repository/base.repository';
import { PaginatedResponse } from '../dto/shared/response.dto';
import { PaginationRequest } from '../dto/shared/pagination.dto';

/**
 * Classe base para serviços
 * Implementa lógica de negócio comum
 */
@Injectable({
  providedIn: 'root'
})
export abstract class BaseService<T, CreateDto, UpdateDto> {
  
  protected loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  protected errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  protected dataSubject = new BehaviorSubject<T[]>([]);
  public data$ = this.dataSubject.asObservable();

  protected selectedItemSubject = new BehaviorSubject<T | null>(null);
  public selectedItem$ = this.selectedItemSubject.asObservable();

  constructor(protected repository: BaseRepository<T, CreateDto, UpdateDto>) {}

  /**
   * Buscar todos os registros
   */
  findAll(pagination?: PaginationRequest): Observable<PaginatedResponse<T>> {
    this.setLoading(true);
    this.clearError();

    return this.repository.findAll(pagination).pipe(
      tap(response => {
        this.dataSubject.next(response.content);
      }),
      catchError(error => {
        this.setError(error.message);
        return of({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0, first: true, last: true, numberOfElements: 0 });
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Buscar por ID
   */
  findById(id: number): Observable<T | null> {
    this.setLoading(true);
    this.clearError();

    return this.repository.findById(id).pipe(
      tap(item => {
        this.selectedItemSubject.next(item);
      }),
      catchError(error => {
        this.setError(error.message);
        return of(null);
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Criar novo registro
   */
  create(data: CreateDto): Observable<T | null> {
    this.setLoading(true);
    this.clearError();

    return this.repository.create(data).pipe(
      tap(item => {
        // Adicionar à lista atual
        const currentData = this.dataSubject.value;
        this.dataSubject.next([...currentData, item]);
        this.selectedItemSubject.next(item);
      }),
      catchError(error => {
        this.setError(error.message);
        return of(null);
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Atualizar registro
   */
  update(id: number, data: UpdateDto): Observable<T | null> {
    this.setLoading(true);
    this.clearError();

    return this.repository.update(id, data).pipe(
      tap(updatedItem => {
        // Atualizar na lista atual
        const currentData = this.dataSubject.value;
        const updatedData = currentData.map(item => 
          (item as any).id === id ? updatedItem : item
        );
        this.dataSubject.next(updatedData);
        this.selectedItemSubject.next(updatedItem);
      }),
      catchError(error => {
        this.setError(error.message);
        return of(null);
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Excluir registro
   */
  delete(id: number): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.repository.delete(id).pipe(
      tap(() => {
        // Remover da lista atual
        const currentData = this.dataSubject.value;
        const filteredData = currentData.filter(item => (item as any).id !== id);
        this.dataSubject.next(filteredData);
        
        // Limpar item selecionado se for o mesmo
        const selectedItem = this.selectedItemSubject.value;
        if (selectedItem && (selectedItem as any).id === id) {
          this.selectedItemSubject.next(null);
        }
      }),
      map(() => true),
      catchError(error => {
        this.setError(error.message);
        return of(false);
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Buscar com filtros
   */
  findByFilters(filters: any, pagination?: PaginationRequest): Observable<PaginatedResponse<T>> {
    this.setLoading(true);
    this.clearError();

    return this.repository.findByFilters(filters, pagination).pipe(
      tap(response => {
        this.dataSubject.next(response.content);
      }),
      catchError(error => {
        this.setError(error.message);
        return of({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0, first: true, last: true, numberOfElements: 0 });
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Buscar todos sem paginação
   */
  findAllSimple(): Observable<T[]> {
    this.setLoading(true);
    this.clearError();

    return this.repository.findAllSimple().pipe(
      tap(data => {
        this.dataSubject.next(data);
      }),
      catchError(error => {
        this.setError(error.message);
        return of([]);
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Verificar se existe
   */
  exists(id: number): Observable<boolean> {
    return this.repository.exists(id).pipe(
      catchError(() => of(false))
    );
  }

  /**
   * Contar registros
   */
  count(filters?: any): Observable<number> {
    return this.repository.count(filters).pipe(
      catchError(() => of(0))
    );
  }

  /**
   * Selecionar item
   */
  selectItem(item: T | null): void {
    this.selectedItemSubject.next(item);
  }

  /**
   * Limpar dados
   */
  clearData(): void {
    this.dataSubject.next([]);
    this.selectedItemSubject.next(null);
    this.clearError();
  }

  /**
   * Definir loading
   */
  protected setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Definir erro
   */
  protected setError(error: string): void {
    this.errorSubject.next(error);
  }

  /**
   * Limpar erro
   */
  protected clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Obter dados atuais
   */
  getCurrentData(): T[] {
    return this.dataSubject.value;
  }

  /**
   * Obter item selecionado
   */
  getSelectedItem(): T | null {
    return this.selectedItemSubject.value;
  }

  /**
   * Verificar se está carregando
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Obter erro atual
   */
  getCurrentError(): string | null {
    return this.errorSubject.value;
  }
} 