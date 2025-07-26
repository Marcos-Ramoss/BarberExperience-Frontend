import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { DashboardRepository } from '../repository/dashboard.repository';
import { DashboardData, DashboardStats, AtividadeRecente } from '@/dto/dashboard/dashboard.dto';

/**
 * Serviço do dashboard
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private dashboardDataSubject = new BehaviorSubject<DashboardData | null>(null);
  public dashboardData$ = this.dashboardDataSubject.asObservable();

  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  private atividadesSubject = new BehaviorSubject<AtividadeRecente[]>([]);
  public atividades$ = this.atividadesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private dashboardRepository: DashboardRepository) {}

  /**
   * Carregar dados completos do dashboard
   */
  loadDashboardData(): Observable<DashboardData | null> {
    this.setLoading(true);
    this.clearError();

    return this.dashboardRepository.getDashboardData().pipe(
      tap(data => {
        this.dashboardDataSubject.next(data);
        this.statsSubject.next(data.stats);
        this.atividadesSubject.next(data.atividadesRecentes);
      }),
      catchError(error => {
        this.setError(error.message);
        return of(null);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Carregar apenas estatísticas
   */
  loadStats(): Observable<DashboardStats | null> {
    this.setLoading(true);
    this.clearError();

    return this.dashboardRepository.getStats().pipe(
      tap(stats => {
        this.statsSubject.next(stats);
      }),
      catchError(error => {
        this.setError(error.message);
        return of(null);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Carregar atividades recentes
   */
  loadAtividadesRecentes(): Observable<AtividadeRecente[] | null> {
    this.setLoading(true);
    this.clearError();

    return this.dashboardRepository.getAtividadesRecentes().pipe(
      tap(atividades => {
        this.atividadesSubject.next(atividades);
      }),
      catchError(error => {
        this.setError(error.message);
        return of(null);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Obter dados atuais do dashboard
   */
  getCurrentDashboardData(): DashboardData | null {
    return this.dashboardDataSubject.value;
  }

  /**
   * Obter estatísticas atuais
   */
  getCurrentStats(): DashboardStats | null {
    return this.statsSubject.value;
  }

  /**
   * Obter atividades atuais
   */
  getCurrentAtividades(): AtividadeRecente[] {
    return this.atividadesSubject.value;
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

  /**
   * Limpar dados do dashboard
   */
  clearDashboardData(): void {
    this.dashboardDataSubject.next(null);
    this.statsSubject.next(null);
    this.atividadesSubject.next([]);
  }

  /**
   * Atualizar estatísticas
   */
  refreshStats(): Observable<DashboardStats | null> {
    return this.loadStats();
  }

  /**
   * Atualizar atividades
   */
  refreshAtividades(): Observable<AtividadeRecente[] | null> {
    return this.loadAtividadesRecentes();
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