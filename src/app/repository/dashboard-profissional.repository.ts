import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseRepository } from './base.repository';
import { environment } from '../../environments/environment';
import { 
  DashboardProfissionalData, 
  EstatisticasProfissional,
  DashboardProfissionalFilter 
} from '../dto/dashboard-profissional/dashboard-profissional.dto';
import { ProfissionalResponse } from '../dto/profissional/profissional.dto';
import { AgendamentoResponse } from '../dto/agendamento/agendamento.dto';

/**
 * Repositório para operações do dashboard profissional
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardProfissionalRepository extends BaseRepository<DashboardProfissionalData, any, any> {
  
  protected endpoint = 'dashboard-profissional';

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Obter dados completos do dashboard profissional
   */
  getDashboardData(profissionalId: number, filtros?: DashboardProfissionalFilter): Observable<DashboardProfissionalData> {
    // Buscar dados de todos os endpoints reais
    return forkJoin({
      profissional: this.http.get<ProfissionalResponse>(`${this.baseUrl}/profissionais/${profissionalId}`, { headers: this.getAuthHeaders() }),
      agendamentos: this.http.get<AgendamentoResponse[]>(`${this.baseUrl}/agendamentos`, { headers: this.getAuthHeaders() })
    }).pipe(
      map(response => {
        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);

        // Filtrar agendamentos do profissional
        const agendamentosProfissional = response.agendamentos.filter(
          (agendamento: AgendamentoResponse) => agendamento.profissional.id === profissionalId
        );

        // Filtrar por período
        const agendamentosHoje = agendamentosProfissional.filter((agendamento: AgendamentoResponse) => {
          const dataAgendamento = new Date(agendamento.horario);
          return dataAgendamento.toDateString() === hoje.toDateString();
        });

        const agendamentosSemana = agendamentosProfissional.filter((agendamento: AgendamentoResponse) => {
          const dataAgendamento = new Date(agendamento.horario);
          return dataAgendamento >= inicioSemana;
        });

        const agendamentosMes = agendamentosProfissional.filter((agendamento: AgendamentoResponse) => {
          const dataAgendamento = new Date(agendamento.horario);
          return dataAgendamento >= inicioMes;
        });

        const agendamentosAno = agendamentosProfissional.filter((agendamento: AgendamentoResponse) => {
          const dataAgendamento = new Date(agendamento.horario);
          return dataAgendamento >= inicioAno;
        });

        // Calcular faturamento
        const calcularFaturamento = (agendamentos: AgendamentoResponse[]) => {
          return agendamentos.reduce((total, agendamento) => {
            const valorServicos = agendamento.servicos?.reduce((sum: number, servico: any) => {
              let preco = 0;
              if (typeof servico.preco === 'string') {
                preco = parseFloat(servico.preco.replace('R$ ', '').replace(',', '.')) || 0;
              } else if (typeof servico.preco === 'number') {
                preco = servico.preco;
              }
              return sum + preco;
            }, 0) || 0;
            return total + valorServicos;
          }, 0);
        };

        // Calcular estatísticas
        const estatisticas: EstatisticasProfissional = {
          totalAgendamentos: agendamentosProfissional.length,
          agendamentosMes: agendamentosMes.length,
          agendamentosSemana: agendamentosSemana.length,
          agendamentosHoje: agendamentosHoje.length,
          faturamentoMes: calcularFaturamento(agendamentosMes),
          faturamentoAno: calcularFaturamento(agendamentosAno),
          faturamentoHoje: calcularFaturamento(agendamentosHoje),
          avaliacaoMedia: 4.5, // Mock - será implementado quando houver sistema de avaliações
          totalAvaliacoes: 0, // Mock
          taxaOcupacao: 85, // Mock - será calculado baseado na disponibilidade
          clientesAtendidos: new Set(agendamentosProfissional.map(a => a.cliente.id)).size,
          servicosRealizados: agendamentosProfissional.reduce((total, a) => total + a.servicos.length, 0)
        };

        // Gerar dados para gráficos
        const gerarDadosGrafico = (agendamentos: AgendamentoResponse[], tipo: 'agendamentos' | 'faturamento') => {
          const dados: any[] = [];
          const periodos = ['Hoje', 'Esta Semana', 'Este Mês', 'Este Ano'];
          const valores = [
            tipo === 'agendamentos' ? agendamentosHoje.length : calcularFaturamento(agendamentosHoje),
            tipo === 'agendamentos' ? agendamentosSemana.length : calcularFaturamento(agendamentosSemana),
            tipo === 'agendamentos' ? agendamentosMes.length : calcularFaturamento(agendamentosMes),
            tipo === 'agendamentos' ? agendamentosAno.length : calcularFaturamento(agendamentosAno)
          ];

          periodos.forEach((periodo, index) => {
            dados.push({
              label: periodo,
              value: valores[index],
              color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][index]
            });
          });

          return dados;
        };

        // Calcular serviços mais realizados
        const servicosCount: { [key: string]: { servico: any; quantidade: number; faturamento: number } } = {};
        agendamentosProfissional.forEach(agendamento => {
          agendamento.servicos.forEach(servico => {
            const servicoId = servico.id.toString();
            if (!servicosCount[servicoId]) {
              servicosCount[servicoId] = {
                servico: servico,
                quantidade: 0,
                faturamento: 0
              };
            }
            servicosCount[servicoId].quantidade++;
            const preco = typeof servico.preco === 'string' 
              ? parseFloat(servico.preco.replace('R$ ', '').replace(',', '.')) || 0
              : servico.preco || 0;
            servicosCount[servicoId].faturamento += preco;
          });
        });

        const servicosMaisRealizados = Object.values(servicosCount)
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5);

        // Calcular clientes frequentes
        const clientesCount: { [key: string]: { cliente: any; totalAgendamentos: number; ultimaVisita: string } } = {};
        agendamentosProfissional.forEach(agendamento => {
          const clienteId = agendamento.cliente.id.toString();
          if (!clientesCount[clienteId]) {
            clientesCount[clienteId] = {
              cliente: agendamento.cliente,
              totalAgendamentos: 0,
              ultimaVisita: agendamento.horario
            };
          }
          clientesCount[clienteId].totalAgendamentos++;
          if (new Date(agendamento.horario) > new Date(clientesCount[clienteId].ultimaVisita)) {
            clientesCount[clienteId].ultimaVisita = agendamento.horario;
          }
        });

        const clientesFrequentes = Object.values(clientesCount)
          .sort((a, b) => b.totalAgendamentos - a.totalAgendamentos)
          .slice(0, 5);

        const dashboardData: DashboardProfissionalData = {
          profissional: response.profissional,
          agendaHoje: agendamentosHoje,
          proximosAgendamentos: agendamentosProfissional
            .filter((agendamento: AgendamentoResponse) => new Date(agendamento.horario) > hoje)
            .sort((a, b) => new Date(a.horario).getTime() - new Date(b.horario).getTime())
            .slice(0, 10),
          agendamentosRecentes: agendamentosProfissional
            .sort((a, b) => new Date(b.horario).getTime() - new Date(a.horario).getTime())
            .slice(0, 10),
          estatisticas: estatisticas,
          graficos: {
            agendamentosPorPeriodo: gerarDadosGrafico(agendamentosProfissional, 'agendamentos'),
            faturamentoPorPeriodo: gerarDadosGrafico(agendamentosProfissional, 'faturamento'),
            servicosPorTipo: servicosMaisRealizados.map(s => ({
              label: s.servico.nome,
              value: s.quantidade,
              color: '#FF6384'
            })),
            avaliacoesPorPeriodo: [] // Mock - será implementado quando houver sistema de avaliações
          },
          clientesFrequentes: clientesFrequentes,
          servicosMaisRealizados: servicosMaisRealizados
        };

        return dashboardData;
      }),
      catchError(error => {
        console.error('Erro ao carregar dados do dashboard profissional:', error);
        return this.getMockData();
      })
    );
  }

  /**
   * Obter estatísticas do profissional
   */
  getEstatisticas(profissionalId: number): Observable<EstatisticasProfissional> {
    return this.getDashboardData(profissionalId).pipe(
      map(data => data.estatisticas)
    );
  }

  /**
   * Obter agendamentos do profissional
   */
  getAgendamentosProfissional(profissionalId: number): Observable<AgendamentoResponse[]> {
    return this.http.get<AgendamentoResponse[]>(`${this.baseUrl}/agendamentos`, { headers: this.getAuthHeaders() })
      .pipe(
        map(agendamentos => agendamentos.filter(a => a.profissional.id === profissionalId)),
        catchError(error => {
          console.error('Erro ao carregar agendamentos do profissional:', error);
          return of([]);
        })
      );
  }

  /**
   * Dados mock para fallback
   */
  private getMockData(): Observable<DashboardProfissionalData> {
    const mockData: DashboardProfissionalData = {
      profissional: {} as ProfissionalResponse,
      agendaHoje: [],
      proximosAgendamentos: [],
      agendamentosRecentes: [],
      estatisticas: {
        totalAgendamentos: 0,
        agendamentosMes: 0,
        agendamentosSemana: 0,
        agendamentosHoje: 0,
        faturamentoMes: 0,
        faturamentoAno: 0,
        faturamentoHoje: 0,
        avaliacaoMedia: 0,
        totalAvaliacoes: 0,
        taxaOcupacao: 0,
        clientesAtendidos: 0,
        servicosRealizados: 0
      },
      graficos: {
        agendamentosPorPeriodo: [],
        faturamentoPorPeriodo: [],
        servicosPorTipo: [],
        avaliacoesPorPeriodo: []
      },
      clientesFrequentes: [],
      servicosMaisRealizados: []
    };

    return of(mockData);
  }
} 