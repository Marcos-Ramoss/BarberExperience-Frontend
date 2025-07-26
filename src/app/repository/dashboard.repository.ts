import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { BaseRepository } from './base.repository';
import { environment } from '../../environments/environment';
import { AtividadeRecente, DashboardData, DashboardStats } from '@/dto/dashboard/dashboard.dto';



/**
 * Repositório para operações do dashboard
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardRepository extends BaseRepository<DashboardData, any, any> {
  
  protected endpoint = 'dashboard';

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Obter dados do dashboard
   */
  getDashboardData(): Observable<DashboardData> {
    // Mock data enquanto o backend não tem os endpoints
    const mockData: DashboardData = {
      stats: {
        totalBarbearias: 5,
        totalProfissionais: 12,
        totalClientes: 150,
        totalAgendamentos: 89,
        agendamentosHoje: 8,
        agendamentosSemana: 45,
        faturamentoMes: 12500.50,
        faturamentoAno: 145000.75
      },
      atividadesRecentes: [
        {
          id: 1,
          tipo: 'AGENDAMENTO',
          descricao: 'Novo agendamento criado',
          data: new Date().toISOString(),
          usuario: 'João Silva',
          valor: 45.00
        },
        {
          id: 2,
          tipo: 'CADASTRO',
          descricao: 'Novo cliente cadastrado',
          data: new Date(Date.now() - 3600000).toISOString(),
          usuario: 'Maria Santos'
        },
        {
          id: 3,
          tipo: 'PAGAMENTO',
          descricao: 'Pagamento realizado',
          data: new Date(Date.now() - 7200000).toISOString(),
          usuario: 'Pedro Costa',
          valor: 30.00
        },
        {
          id: 4,
          tipo: 'CANCELAMENTO',
          descricao: 'Agendamento cancelado',
          data: new Date(Date.now() - 10800000).toISOString(),
          usuario: 'Ana Oliveira'
        }
      ],
      agendamentosProximos: [],
      graficoAgendamentos: []
    };

    return of(mockData).pipe(
      // Simular delay de rede
      delay(500)
    );
  }

  /**
   * Obter estatísticas
   */
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obter atividades recentes
   */
  getAtividadesRecentes(): Observable<AtividadeRecente[]> {
    return this.http.get<AtividadeRecente[]>(`${this.baseUrl}/dashboard/atividades`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obter agendamentos próximos
   */
  getAgendamentosProximos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/agendamentos-proximos`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obter dados para gráfico de agendamentos
   */
  getGraficoAgendamentos(periodo: 'dia' | 'semana' | 'mes' = 'semana'): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/grafico-agendamentos?periodo=${periodo}`)
      .pipe(
        catchError(this.handleError)
      );
  }
} 