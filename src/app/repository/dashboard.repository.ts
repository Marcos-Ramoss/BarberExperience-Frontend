import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
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
   * Obter dados do dashboard usando endpoints reais
   */
  getDashboardData(): Observable<DashboardData> {
    // Buscar dados de todos os endpoints reais
    return forkJoin({
      barbearias: this.http.get<any[]>(`${this.baseUrl}/barbearias`, { headers: this.getAuthHeaders() }),
      profissionais: this.http.get<any[]>(`${this.baseUrl}/profissionais`, { headers: this.getAuthHeaders() }),
      clientes: this.http.get<any[]>(`${this.baseUrl}/clientes`, { headers: this.getAuthHeaders() }),
      agendamentos: this.http.get<any[]>(`${this.baseUrl}/agendamentos`, { headers: this.getAuthHeaders() })
    }).pipe(
      map(response => {
        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);

        // Filtrar agendamentos por período
        const agendamentosHoje = response.agendamentos.filter((agendamento: any) => {
          const dataAgendamento = new Date(agendamento.horario);
          return dataAgendamento.toDateString() === hoje.toDateString();
        });

        const agendamentosSemana = response.agendamentos.filter((agendamento: any) => {
          const dataAgendamento = new Date(agendamento.horario);
          return dataAgendamento >= inicioSemana;
        });

        const agendamentosMes = response.agendamentos.filter((agendamento: any) => {
          const dataAgendamento = new Date(agendamento.horario);
          return dataAgendamento >= inicioMes;
        });

        const agendamentosAno = response.agendamentos.filter((agendamento: any) => {
          const dataAgendamento = new Date(agendamento.horario);
          return dataAgendamento >= inicioAno;
        });

        // Calcular faturamento (soma dos valores dos serviços)
        const calcularFaturamento = (agendamentos: any[]) => {
          return agendamentos.reduce((total, agendamento) => {
            const valorServicos = agendamento.servicos?.reduce((sum: number, servico: any) => {
              // Lidar com diferentes formatos de preço
              let preco = 0;
              if (typeof servico.preco === 'string') {
                // Remover "R$ " e converter para número
                preco = parseFloat(servico.preco.replace('R$ ', '').replace(',', '.')) || 0;
              } else if (typeof servico.preco === 'number') {
                preco = servico.preco;
              }
              return sum + preco;
            }, 0) || 0;
            return total + valorServicos;
          }, 0);
        };

        const faturamentoMes = calcularFaturamento(agendamentosMes);
        const faturamentoAno = calcularFaturamento(agendamentosAno);

        // Gerar atividades recentes baseadas nos agendamentos
        const atividadesRecentes = response.agendamentos
          .slice(0, 5) // Últimos 5 agendamentos
          .map((agendamento: any, index: number) => {
            const valorTotal = agendamento.servicos?.reduce((sum: number, servico: any) => {
              // Lidar com diferentes formatos de preço
              let preco = 0;
              if (typeof servico.preco === 'string') {
                // Remover "R$ " e converter para número
                preco = parseFloat(servico.preco.replace('R$ ', '').replace(',', '.')) || 0;
              } else if (typeof servico.preco === 'number') {
                preco = servico.preco;
              }
              return sum + preco;
            }, 0) || 0;

            return {
              id: agendamento.id,
              tipo: 'AGENDAMENTO' as const,
              descricao: `Agendamento para ${agendamento.cliente?.nome || 'Cliente'}`,
              data: agendamento.horario,
              usuario: agendamento.profissional?.nome || 'Profissional',
              valor: valorTotal
            };
          });

        const dashboardData: DashboardData = {
          stats: {
            totalBarbearias: response.barbearias.length,
            totalProfissionais: response.profissionais.length,
            totalClientes: response.clientes.length,
            totalAgendamentos: response.agendamentos.length,
            agendamentosHoje: agendamentosHoje.length,
            agendamentosSemana: agendamentosSemana.length,
            faturamentoMes: faturamentoMes,
            faturamentoAno: faturamentoAno
          },
          atividadesRecentes: atividadesRecentes,
          agendamentosProximos: response.agendamentos
            .filter((agendamento: any) => new Date(agendamento.horario) > hoje)
            .slice(0, 10),
          graficoAgendamentos: []
        };

        return dashboardData;
      }),
      catchError(error => {
        console.error('Erro ao carregar dados do dashboard:', error);
        // Fallback para dados mock em caso de erro
        return this.getMockData();
      })
    );
  }

  /**
   * Obter estatísticas
   */
  getStats(): Observable<DashboardStats> {
    return this.getDashboardData().pipe(
      map(data => data.stats)
    );
  }

  /**
   * Obter atividades recentes
   */
  getAtividadesRecentes(): Observable<AtividadeRecente[]> {
    return this.getDashboardData().pipe(
      map(data => data.atividadesRecentes)
    );
  }

  /**
   * Obter agendamentos próximos
   */
  getAgendamentosProximos(): Observable<any[]> {
    return this.getDashboardData().pipe(
      map(data => data.agendamentosProximos)
    );
  }

  /**
   * Obter dados para gráfico de agendamentos
   */
  getGraficoAgendamentos(periodo: 'dia' | 'semana' | 'mes' = 'semana'): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/grafico-agendamentos?periodo=${periodo}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erro ao carregar gráfico de agendamentos:', error);
          return of([]);
        })
      );
  }

  /**
   * Dados mock para fallback
   */
  private getMockData(): Observable<DashboardData> {
    const mockData: DashboardData = {
      stats: {
        totalBarbearias: 0,
        totalProfissionais: 0,
        totalClientes: 0,
        totalAgendamentos: 0,
        agendamentosHoje: 0,
        agendamentosSemana: 0,
        faturamentoMes: 0,
        faturamentoAno: 0
      },
      atividadesRecentes: [],
      agendamentosProximos: [],
      graficoAgendamentos: []
    };

    return of(mockData).pipe(delay(100));
  }
} 