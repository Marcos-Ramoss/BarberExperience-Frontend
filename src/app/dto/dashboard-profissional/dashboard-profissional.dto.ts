/**
 * DTOs para o Dashboard Profissional
 */

import { ProfissionalResponse } from '../profissional/profissional.dto';
import { AgendamentoResponse } from '../agendamento/agendamento.dto';

/**
 * Estatísticas do profissional
 */
export interface EstatisticasProfissional {
  totalAgendamentos: number;
  agendamentosMes: number;
  agendamentosSemana: number;
  agendamentosHoje: number;
  faturamentoMes: number;
  faturamentoAno: number;
  faturamentoHoje: number;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  taxaOcupacao: number;
  clientesAtendidos: number;
  servicosRealizados: number;
}

/**
 * Dados para gráficos
 */
export interface DadosGrafico {
  label: string;
  value: number;
  color?: string;
}

/**
 * Dados do dashboard profissional
 */
export interface DashboardProfissionalData {
  profissional: ProfissionalResponse;
  agendaHoje: AgendamentoResponse[];
  proximosAgendamentos: AgendamentoResponse[];
  agendamentosRecentes: AgendamentoResponse[];
  estatisticas: EstatisticasProfissional;
  graficos: {
    agendamentosPorPeriodo: DadosGrafico[];
    faturamentoPorPeriodo: DadosGrafico[];
    servicosPorTipo: DadosGrafico[];
    avaliacoesPorPeriodo: DadosGrafico[];
  };
  clientesFrequentes: Array<{
    cliente: any;
    totalAgendamentos: number;
    ultimaVisita: string;
  }>;
  servicosMaisRealizados: Array<{
    servico: any;
    quantidade: number;
    faturamento: number;
  }>;
}

/**
 * Filtros para o dashboard
 */
export interface DashboardProfissionalFilter {
  dataInicio?: string;
  dataFim?: string;
  periodo?: 'dia' | 'semana' | 'mes' | 'ano';
  barbeariaId?: number;
} 