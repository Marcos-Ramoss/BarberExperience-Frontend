import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { AtividadeRecente, DashboardStats } from '@/dto/dashboard/dashboard.dto';

/**
 * Componente do dashboard
 */
@Component({
  selector: 'app-dashboard',
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
    TooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  stats: DashboardStats | null = null;
  atividades: AtividadeRecente[] = [];
  loading = false;
  errorMessage = '';
  currentUser: any = null;

  // Dados para gráficos
  chartData: any;
  chartOptions: any;

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
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
    this.dashboardService.loadDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // Inscrever-se nos observables
    this.dashboardService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
        this.updateChartData();
      });

    this.dashboardService.atividades$
      .pipe(takeUntil(this.destroy$))
      .subscribe(atividades => {
        this.atividades = atividades;
      });

    this.dashboardService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });

    this.dashboardService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error || '';
      });
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
    if (this.stats) {
      this.chartData = {
        labels: ['Barbearias', 'Profissionais', 'Clientes', 'Agendamentos'],
        datasets: [
          {
            label: 'Quantidade',
            data: [
              this.stats.totalBarbearias,
              this.stats.totalProfissionais,
              this.stats.totalClientes,
              this.stats.totalAgendamentos
            ],
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0'
            ],
            borderColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0'
            ],
            borderWidth: 1
          }
        ]
      };
    }
  }

  /**
   * Obter cor do tag baseado no tipo de atividade
   */
  getTagSeverity(tipo: string): string {
    switch (tipo) {
      case 'AGENDAMENTO':
        return 'success';
      case 'CADASTRO':
        return 'info';
      case 'CANCELAMENTO':
        return 'danger';
      case 'PAGAMENTO':
        return 'warning';
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
   * Navegar para módulo específico
   */
  navigateToModule(module: string): void {
    this.router.navigate([`/${module}`]);
  }

  /**
   * Atualizar dashboard
   */
  refreshDashboard(): void {
    this.dashboardService.loadDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  /**
   * Fazer logout
   */
  logout(): void {
    this.authService.logout();
  }
} 