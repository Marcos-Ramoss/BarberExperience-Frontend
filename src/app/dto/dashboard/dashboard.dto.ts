/**
 * Interface para estatísticas do dashboard
 */
export interface DashboardStats {
    totalBarbearias: number;
    totalProfissionais: number;
    totalClientes: number;
    totalAgendamentos: number;
    agendamentosHoje: number;
    agendamentosSemana: number;
    faturamentoMes: number;
    faturamentoAno: number;
  }
  
  /**
   * Interface para atividades recentes
   */
  export interface AtividadeRecente {
    id: number;
    tipo: 'AGENDAMENTO' | 'CADASTRO' | 'CANCELAMENTO' | 'PAGAMENTO';
    descricao: string;
    data: string;
    usuario: string;
    valor?: number;
  }
  
  /**
   * Interface para dados do dashboard
   */
  export interface DashboardData {
    stats: DashboardStats;
    atividadesRecentes: AtividadeRecente[];
    agendamentosProximos: any[];
    graficoAgendamentos: any[];
  }