import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { DashboardProfissionalRepository } from '../repository/dashboard-profissional.repository';
import { 
  DashboardProfissionalData, 
  EstatisticasProfissional,
  DashboardProfissionalFilter 
} from '../dto/dashboard-profissional/dashboard-profissional.dto';
import { AgendamentoResponse } from '../dto/agendamento/agendamento.dto';

/**
 * Serviço do dashboard profissional
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardProfissionalService {

  private dashboardDataSubject = new BehaviorSubject<DashboardProfissionalData | null>(null);
  public dashboardData$ = this.dashboardDataSubject.asObservable();

  private estatisticasSubject = new BehaviorSubject<EstatisticasProfissional | null>(null);
  public estatisticas$ = this.estatisticasSubject.asObservable();

  private agendaHojeSubject = new BehaviorSubject<AgendamentoResponse[]>([]);
  public agendaHoje$ = this.agendaHojeSubject.asObservable();

  private proximosAgendamentosSubject = new BehaviorSubject<AgendamentoResponse[]>([]);
  public proximosAgendamentos$ = this.proximosAgendamentosSubject.asObservable();

  private agendamentosRecentesSubject = new BehaviorSubject<AgendamentoResponse[]>([]);
  public agendamentosRecentes$ = this.agendamentosRecentesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private dashboardProfissionalRepository: DashboardProfissionalRepository) {}

  /**
   * Carregar dados completos do dashboard profissional
   */
  loadDashboardData(profissionalId: number, filtros?: DashboardProfissionalFilter): Observable<DashboardProfissionalData | null> {
    this.setLoading(true);
    this.clearError();

    return this.dashboardProfissionalRepository.getDashboardData(profissionalId, filtros).pipe(
      tap(data => {
        this.dashboardDataSubject.next(data);
        this.estatisticasSubject.next(data.estatisticas);
        this.agendaHojeSubject.next(data.agendaHoje);
        this.proximosAgendamentosSubject.next(data.proximosAgendamentos);
        this.agendamentosRecentesSubject.next(data.agendamentosRecentes);
      }),
      catchError(error => {
        this.setError(error.message);
        return [];
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Carregar apenas estatísticas
   */
  loadEstatisticas(profissionalId: number): Observable<EstatisticasProfissional | null> {
    this.setLoading(true);
    this.clearError();

    return this.dashboardProfissionalRepository.getEstatisticas(profissionalId).pipe(
      tap(estatisticas => {
        this.estatisticasSubject.next(estatisticas);
      }),
      catchError(error => {
        this.setError(error.message);
        return [];
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Carregar agendamentos do profissional
   */
  loadAgendamentosProfissional(profissionalId: number): Observable<AgendamentoResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.dashboardProfissionalRepository.getAgendamentosProfissional(profissionalId).pipe(
      tap(agendamentos => {
        // Separar agendamentos por tipo
        const hoje = new Date();
        const agendaHoje = agendamentos.filter(a => {
          const dataAgendamento = new Date(a.horario);
          return dataAgendamento.toDateString() === hoje.toDateString();
        });
        const proximos = agendamentos
          .filter(a => new Date(a.horario) > hoje)
          .sort((a, b) => new Date(a.horario).getTime() - new Date(b.horario).getTime())
          .slice(0, 10);
        const recentes = agendamentos
          .sort((a, b) => new Date(b.horario).getTime() - new Date(a.horario).getTime())
          .slice(0, 10);

        this.agendaHojeSubject.next(agendaHoje);
        this.proximosAgendamentosSubject.next(proximos);
        this.agendamentosRecentesSubject.next(recentes);
      }),
      catchError(error => {
        this.setError(error.message);
        return [];
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Obter dados atuais do dashboard
   */
  getCurrentDashboardData(): DashboardProfissionalData | null {
    return this.dashboardDataSubject.value;
  }

  /**
   * Obter estatísticas atuais
   */
  getCurrentEstatisticas(): EstatisticasProfissional | null {
    return this.estatisticasSubject.value;
  }

  /**
   * Obter agenda de hoje
   */
  getCurrentAgendaHoje(): AgendamentoResponse[] {
    return this.agendaHojeSubject.value;
  }

  /**
   * Obter próximos agendamentos
   */
  getCurrentProximosAgendamentos(): AgendamentoResponse[] {
    return this.proximosAgendamentosSubject.value;
  }

  /**
   * Obter agendamentos recentes
   */
  getCurrentAgendamentosRecentes(): AgendamentoResponse[] {
    return this.agendamentosRecentesSubject.value;
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
    this.estatisticasSubject.next(null);
    this.agendaHojeSubject.next([]);
    this.proximosAgendamentosSubject.next([]);
    this.agendamentosRecentesSubject.next([]);
  }

  /**
   * Atualizar dashboard
   */
  refreshDashboard(profissionalId: number, filtros?: DashboardProfissionalFilter): Observable<DashboardProfissionalData | null> {
    return this.loadDashboardData(profissionalId, filtros);
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