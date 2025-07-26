import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
// Services
import { AgendamentoService } from '../../../services/agendamento.service';
import { ClienteService } from '../../../services/cliente.service';
import { ProfissionalService } from '../../../services/profissional.service';
import { BarbeariaService } from '../../../services/barbearia.service';

// DTOs
import { AgendamentoResponse, AgendamentoFilter, StatusAgendamento } from '../../../dto/agendamento/agendamento.dto';
import { ClienteResponse } from '../../../dto/cliente/cliente.dto';
import { ProfissionalResponse } from '../../../dto/profissional/profissional.dto';
import { BarbeariaResponse } from '../../../dto/barbearia/barbearia.dto';

// Components
import { AgendamentoModalComponent } from '../modal/agendamento-modal.component';

@Component({
  selector: 'app-agendamento-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    ToastModule,
    MessageModule,
    TooltipModule,
    TagModule,
    AgendamentoModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './agendamento-list.component.html',
  styleUrls: ['./agendamento-list.component.scss']
})
export class AgendamentoListComponent implements OnInit, OnDestroy {
  @ViewChild('agendamentoModal') agendamentoModal!: AgendamentoModalComponent;

  // Dados
  agendamentos: AgendamentoResponse[] = [];
  agendamentosFiltradas: AgendamentoResponse[] = [];
  clientes: ClienteResponse[] = [];
  profissionais: ProfissionalResponse[] = [];
  barbearias: BarbeariaResponse[] = [];
  loading = false;
  error: string | null = null;

  // Filtros
  filtro: AgendamentoFilter = {};
  termoBusca = '';
  filtrosAplicados = false;

  // Paginação
  first = 0;
  rows = 10;
  totalRecords = 0;

  // Opções para dropdowns
  opcoesStatus = [
    { label: 'Todos os status', value: null },
    { label: 'Pendente', value: StatusAgendamento.PENDENTE },
    { label: 'Confirmado', value: StatusAgendamento.CONFIRMADO },
    { label: 'Cancelado', value: StatusAgendamento.CANCELADO },
    { label: 'Realizado', value: StatusAgendamento.REALIZADO },
    { label: 'Ausente', value: StatusAgendamento.AUSENTE }
  ];

  opcoesCliente: { label: string; value: number | null }[] = [
    { label: 'Todos os clientes', value: null }
  ];

  opcoesProfissional: { label: string; value: number | null }[] = [
    { label: 'Todos os profissionais', value: null }
  ];

  opcoesBarbearia: { label: string; value: number | null }[] = [
    { label: 'Todas as barbearias', value: null }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private agendamentoService: AgendamentoService,
    private clienteService: ClienteService,
    private profissionalService: ProfissionalService,
    private barbeariaService: BarbeariaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega todos os dados necessários
   */
  private carregarDados(): void {
    this.carregarAgendamentos();
    this.carregarClientes();
    this.carregarProfissionais();
    this.carregarBarbearias();
  }

  /**
   * Carrega os agendamentos
   */
  carregarAgendamentos(): void {
    this.loading = true;
    this.error = null;

    this.agendamentoService.carregarAgendamentos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (agendamentos) => {
          this.agendamentos = agendamentos;
          this.agendamentosFiltradas = agendamentos;
          this.totalRecords = agendamentos.length;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao carregar agendamentos: ' + error.message;
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erro!',
            detail: this.error,
            life: 5000
          });
        }
      });
  }

  /**
   * Carrega os clientes para o dropdown
   */
  private carregarClientes(): void {
    this.clienteService.carregarClientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clientes) => {
          this.clientes = clientes;
          this.opcoesCliente = [
            { label: 'Todos os clientes', value: null },
            ...clientes.map(cliente => ({
              label: cliente.nome,
              value: cliente.id
            }))
          ];
        },
        error: (error) => {
          console.error('Erro ao carregar clientes:', error);
        }
      });
  }

  /**
   * Carrega os profissionais para o dropdown
   */
  private carregarProfissionais(): void {
    this.profissionalService.carregarProfissionais()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profissionais) => {
          this.profissionais = profissionais;
          this.opcoesProfissional = [
            { label: 'Todos os profissionais', value: null },
            ...profissionais.map(profissional => ({
              label: profissional.nome,
              value: profissional.id
            }))
          ];
        },
        error: (error) => {
          console.error('Erro ao carregar profissionais:', error);
        }
      });
  }

  /**
   * Carrega as barbearias para o dropdown
   */
  private carregarBarbearias(): void {
    this.barbeariaService.carregarBarbearias()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (barbearias) => {
          this.barbearias = barbearias;
          this.opcoesBarbearia = [
            { label: 'Todas as barbearias', value: null },
            ...barbearias.map(barbearia => ({
              label: barbearia.nome,
              value: barbearia.id
            }))
          ];
        },
        error: (error) => {
          console.error('Erro ao carregar barbearias:', error);
        }
      });
  }

  /**
   * Aplica os filtros na lista
   */
  aplicarFiltros(): void {
    this.filtrosAplicados = true;
    
    let agendamentosFiltradas = [...this.agendamentos];

    // Filtro por termo de busca
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      agendamentosFiltradas = agendamentosFiltradas.filter(agendamento =>
        agendamento.cliente.nome.toLowerCase().includes(termo) ||
        agendamento.profissional.nome.toLowerCase().includes(termo) ||
        agendamento.status.toLowerCase().includes(termo)
      );
    }

    // Filtro por cliente
    if (this.filtro.clienteId) {
      agendamentosFiltradas = agendamentosFiltradas.filter(
        agendamento => agendamento.cliente.id === this.filtro.clienteId
      );
    }

    // Filtro por profissional
    if (this.filtro.profissionalId) {
      agendamentosFiltradas = agendamentosFiltradas.filter(
        agendamento => agendamento.profissional.id === this.filtro.profissionalId
      );
    }

    // Filtro por status
    if (this.filtro.status) {
      agendamentosFiltradas = agendamentosFiltradas.filter(
        agendamento => agendamento.status === this.filtro.status
      );
    }

    // Filtro por data
    if (this.filtro.dataInicio) {
      agendamentosFiltradas = agendamentosFiltradas.filter(
        agendamento => new Date(agendamento.horario) >= new Date(this.filtro.dataInicio!)
      );
    }

    if (this.filtro.dataFim) {
      agendamentosFiltradas = agendamentosFiltradas.filter(
        agendamento => new Date(agendamento.horario) <= new Date(this.filtro.dataFim!)
      );
    }

    this.agendamentosFiltradas = agendamentosFiltradas;
    this.totalRecords = agendamentosFiltradas.length;
    this.first = 0;
  }

  /**
   * Limpa todos os filtros
   */
  limparFiltros(): void {
    this.termoBusca = '';
    this.filtro = {};
    this.agendamentosFiltradas = [...this.agendamentos];
    this.totalRecords = this.agendamentos.length;
    this.first = 0;
    this.filtrosAplicados = false;
  }

  /**
   * Abre o modal para criar novo agendamento
   */
  novoAgendamento(): void {
    this.agendamentoModal.show();
  }

  /**
   * Abre o modal para editar agendamento
   */
  editarAgendamento(agendamento: AgendamentoResponse): void {
    this.agendamentoModal.show(agendamento);
  }

  /**
   * Confirma e exclui um agendamento
   */
  excluirAgendamento(agendamento: AgendamentoResponse): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o agendamento do cliente "${agendamento.cliente.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.agendamentoService.excluirAgendamento(agendamento.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: `Agendamento do cliente "${agendamento.cliente.nome}" excluído com sucesso!`,
                life: 3000
              });
              // Recarregar lista após exclusão
              setTimeout(() => {
                this.carregarAgendamentos();
              }, 1000);
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao excluir agendamento. Tente novamente.',
                life: 5000
              });
            }
          });
      }
    });
  }

  /**
   * Formata a data e hora para exibição
   */
  formatarDataHora(dataHora: string): string {
    if (!dataHora) return 'N/A';
    
    try {
      const data = new Date(dataHora);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  }

  /**
   * Obtém a severidade do status do agendamento
   */
  getStatusSeverity(status: string): string {
    switch (status) {
      case StatusAgendamento.CONFIRMADO:
        return 'success';
      case StatusAgendamento.PENDENTE:
        return 'warning';
      case StatusAgendamento.CANCELADO:
        return 'danger';
      case StatusAgendamento.REALIZADO:
        return 'info';
      case StatusAgendamento.AUSENTE:
        return 'secondary';
      default:
        return 'info';
    }
  }

  /**
   * Formata os serviços para exibição
   */
  formatarServicos(servicos: any[]): string {
    if (!servicos || servicos.length === 0) return 'N/A';
    return servicos.map(servico => servico.nome).join(', ');
  }

  /**
   * Calcula o valor total dos serviços
   */
  calcularValorTotal(servicos: any[]): string {
    if (!servicos || servicos.length === 0) return 'R$ 0,00';
    
    const total = servicos.reduce((sum, servico) => {
      const preco = parseFloat(servico.preco) || 0;
      return sum + preco;
    }, 0);
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(total);
  }

  /**
   * Handler para agendamento criado
   */
  onAgendamentoCriado(): void {
    this.loading = true;
    setTimeout(() => {
      this.carregarAgendamentos();
    }, 2000);
  }

  /**
   * Handler para agendamento editado
   */
  onAgendamentoEditado(): void {
    this.loading = true;
    setTimeout(() => {
      this.carregarAgendamentos();
    }, 2000);
  }
} 