import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';

import { DashboardProfissionalService } from '../../services/dashboard-profissional.service';
import { AuthService } from '../../services/auth.service';
import { 
  DashboardProfissionalData, 
  EstatisticasProfissional,
  DashboardProfissionalFilter 
} from '../../dto/dashboard-profissional/dashboard-profissional.dto';
import { AgendamentoResponse } from '../../dto/agendamento/agendamento.dto';

/**
 * Componente do dashboard profissional
 */
@Component({
  selector: 'app-dashboard-profissional',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    ChartModule,
    TableModule,
    TagModule,
    TooltipModule,
    AvatarModule,
    BadgeModule
  ],
  templateUrl: './dashboard-profissional.component.html',
  styleUrls: ['./dashboard-profissional.component.scss']
})
export class DashboardProfissionalComponent implements OnInit, OnDestroy {

  dashboardData: DashboardProfissionalData | null = null;
  estatisticas: EstatisticasProfissional | null = null;
  agendaHoje: AgendamentoResponse[] = [];
  proximosAgendamentos: AgendamentoResponse[] = [];
  agendamentosRecentes: AgendamentoResponse[] = [];
  loading = false;
  errorMessage = '';
  currentUser: any = null;
  profissionalId: number = 1; // Mock - será obtido do usuário logado

  // Dados para gráficos
  chartDataAgendamentos: any;
  chartDataFaturamento: any;
  chartDataServicos: any;
  chartOptions: any;

  // Filtros
  filtros: DashboardProfissionalFilter = {
    periodo: 'semana'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardProfissionalService: DashboardProfissionalService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.profissionalId = this.getProfissionalId();
    this.loadDashboardData();
    this.initChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carregar dados do dashboard
   */
  private loadDashboardData(): void {
    this.dashboardProfissionalService.loadDashboardData(this.profissionalId, this.filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // Inscrever-se nos observables
    this.dashboardProfissionalService.dashboardData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.dashboardData = data;
        this.updateChartData();
      });

    this.dashboardProfissionalService.estatisticas$
      .pipe(takeUntil(this.destroy$))
      .subscribe(estatisticas => {
        this.estatisticas = estatisticas;
      });

    this.dashboardProfissionalService.agendaHoje$
      .pipe(takeUntil(this.destroy$))
      .subscribe(agenda => {
        this.agendaHoje = agenda;
      });

    this.dashboardProfissionalService.proximosAgendamentos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(proximos => {
        this.proximosAgendamentos = proximos;
      });

    this.dashboardProfissionalService.agendamentosRecentes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(recentes => {
        this.agendamentosRecentes = recentes;
      });

    this.dashboardProfissionalService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });

    this.dashboardProfissionalService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error || '';
      });
  }

  /**
   * Obter ID do profissional (mock - será implementado com autenticação real)
   */
  private getProfissionalId(): number {
    // ✅ PRIORIDADE 1: ID do usuário logado (profissional)
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.profissional?.id) {
      return currentUser.profissional.id;
    }
    
    // ✅ PRIORIDADE 2: ID da query parameter (para novos profissionais)
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams['profissionalId']) {
      return Number(queryParams['profissionalId']);
    }
    
    // ✅ PRIORIDADE 3: ID do usuário logado (buscar por username)
    if (currentUser?.username) {
      // Buscar profissional por username
      this.authService.buscarProfissionalPorUsername(currentUser.username).subscribe({
        next: (profissional) => {
          if (profissional?.id) {
            this.profissionalId = profissional.id;
            this.loadDashboardData();
          }
        },
        error: (error) => {
          console.error('Erro ao buscar profissional:', error);
        }
      });
    }
    
    // Fallback para ID 1 (apenas para desenvolvimento)
    return 1;
  }

  /**
   * Inicializar configurações do gráfico
   */
  private initChart(): void {
    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };

    this.updateChartData();
  }

  /**
   * Atualizar dados do gráfico
   */
  private updateChartData(): void {
    if (this.dashboardData) {
      // Gráfico de agendamentos por período
      this.chartDataAgendamentos = {
        labels: this.dashboardData.graficos.agendamentosPorPeriodo.map(d => d.label),
        datasets: [
          {
            label: 'Agendamentos',
            data: this.dashboardData.graficos.agendamentosPorPeriodo.map(d => d.value),
            backgroundColor: this.dashboardData.graficos.agendamentosPorPeriodo.map(d => d.color),
            borderColor: this.dashboardData.graficos.agendamentosPorPeriodo.map(d => d.color),
            borderWidth: 1
          }
        ]
      };

      // Gráfico de faturamento por período
      this.chartDataFaturamento = {
        labels: this.dashboardData.graficos.faturamentoPorPeriodo.map(d => d.label),
        datasets: [
          {
            label: 'Faturamento (R$)',
            data: this.dashboardData.graficos.faturamentoPorPeriodo.map(d => d.value),
            backgroundColor: this.dashboardData.graficos.faturamentoPorPeriodo.map(d => d.color),
            borderColor: this.dashboardData.graficos.faturamentoPorPeriodo.map(d => d.color),
            borderWidth: 1
          }
        ]
      };

      // Gráfico de serviços por tipo
      this.chartDataServicos = {
        labels: this.dashboardData.graficos.servicosPorTipo.map(d => d.label),
        datasets: [
          {
            label: 'Quantidade',
            data: this.dashboardData.graficos.servicosPorTipo.map(d => d.value),
            backgroundColor: this.dashboardData.graficos.servicosPorTipo.map(d => d.color),
            borderColor: this.dashboardData.graficos.servicosPorTipo.map(d => d.color),
            borderWidth: 1
          }
        ]
      };
    }
  }

  /**
   * Obter cor do tag baseado no status do agendamento
   */
  getStatusSeverity(status: string): string {
    switch (status) {
      case 'CONFIRMADO':
        return 'success';
      case 'PENDENTE':
        return 'warning';
      case 'CANCELADO':
        return 'danger';
      case 'REALIZADO':
        return 'info';
      default:
        return 'secondary';
    }
  }

  /**
   * Formatar valor monetário
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formatar data
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  /**
   * Formatar hora
   */
  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatar data e hora
   */
  formatDateTime(date: string): string {
    return `${this.formatDate(date)} às ${this.formatTime(date)}`;
  }

  /**
   * Calcular valor total do agendamento
   */
  calcularValorAgendamento(agendamento: AgendamentoResponse): number {
    return agendamento.servicos.reduce((total, servico) => {
      let preco = 0;
      if (typeof servico.preco === 'string') {
        preco = parseFloat(servico.preco.replace('R$ ', '').replace(',', '.')) || 0;
      } else if (typeof servico.preco === 'number') {
        preco = servico.preco;
      }
      return total + preco;
    }, 0);
  }

  /**
   * Navegar para módulo específico
   */
  navigateToModule(module: string): void {
    this.router.navigate([`/${module}`]);
  }

  /**
   * Atualizar dashboard
   */
  refreshDashboard(): void {
    this.dashboardProfissionalService.refreshDashboard(this.profissionalId, this.filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  /**
   * Alterar período do filtro
   */
  onPeriodoChange(): void {
    this.refreshDashboard();
  }

  /**
   * Fazer logout
   */
  logout(): void {
    this.authService.logout();
  }
} 