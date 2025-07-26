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
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

// Services
import { ServicoService } from '../../../services/servico.service';
import { BarbeariaService } from '../../../services/barbearia.service';

// DTOs
import { ServicoResponse, ServicoFilter } from '../../../dto/servico/servico.dto';
import { BarbeariaResponse } from '../../../dto/barbearia/barbearia.dto';

// Components
import { ServicoModalComponent } from '../modal/servico-modal.component';

@Component({
  selector: 'app-servico-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressSpinnerModule,
    MessageModule,
    ServicoModalComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './servico-list.component.html',
  styleUrls: ['./servico-list.component.scss']
})
export class ServicoListComponent implements OnInit, OnDestroy {

  // Dados
  servicos: ServicoResponse[] = [];
  servicosFiltradas: ServicoResponse[] = [];

  // Estados
  loading = false;
  error: string | null = null;

  // Filtros
  filtro: ServicoFilter = {};
  termoBusca = '';

  // Paginação
  first = 0;
  rows = 10;
  totalRecords = 0;

  // Opções para filtros
  opcoesBarbearia: { label: string; value: number | null }[] = [
    { label: 'Todas as Barbearias', value: null }
  ];

  private destroy$ = new Subject<void>();

  @ViewChild('servicoModal') servicoModal!: ServicoModalComponent;

  constructor(
    private servicoService: ServicoService,
    private barbeariaService: BarbeariaService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.carregarServicos();
    this.carregarBarbearias();
    this.subscribeToObservables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega os serviços
   */
  carregarServicos(): void {
    this.servicoService.carregarServicos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // O observable servicos$ vai atualizar automaticamente
        },
        error: (error) => {
          console.error('Erro ao carregar serviços:', error);
        }
      });
  }

  /**
   * Carrega as barbearias para o filtro
   */
  carregarBarbearias(): void {
    this.barbeariaService.carregarBarbearias()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (barbearias) => {
          // Adiciona as barbearias às opções de filtro
          const opcoesBarbearias = barbearias.map(barbearia => ({
            label: barbearia.nome,
            value: barbearia.id
          }));
          this.opcoesBarbearia = [
            { label: 'Todas as Barbearias', value: null },
            ...opcoesBarbearias
          ];
        },
        error: (error) => {
          console.error('Erro ao carregar barbearias:', error);
        }
      });
  }

  /**
   * Inscreve nos observables do service
   */
  private subscribeToObservables(): void {
    // Loading
    this.servicoService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    // Error
    this.servicoService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    // Serviços
    this.servicoService.servicos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(servicos => {
        this.servicos = servicos;
        this.servicosFiltradas = servicos;
        this.totalRecords = servicos.length;
      });
  }

  /**
   * Aplica os filtros na lista
   */
  aplicarFiltros(): void {
    let filtradas = [...this.servicos];

    // Filtro por termo de busca
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      filtradas = filtradas.filter(servico => 
        servico.nome.toLowerCase().includes(termo) ||
        servico.descricao.toLowerCase().includes(termo)
      );
    }

    // Filtro por barbearia
    if (this.filtro.barbeariaId) {
      filtradas = filtradas.filter(servico => 
        servico.barbeariaId === this.filtro.barbeariaId
      );
    }

    // Filtro por preço mínimo
    if (this.filtro.precoMin) {
      filtradas = filtradas.filter(servico => 
        servico.preco >= this.filtro.precoMin!
      );
    }

    // Filtro por preço máximo
    if (this.filtro.precoMax) {
      filtradas = filtradas.filter(servico => 
        servico.preco <= this.filtro.precoMax!
      );
    }

    this.servicosFiltradas = filtradas;
    this.totalRecords = filtradas.length;
    this.first = 0; // Reset para primeira página
  }

  /**
   * Limpa todos os filtros
   */
  limparFiltros(): void {
    this.termoBusca = '';
    this.filtro = {};
    this.aplicarFiltros();
  }

  /**
   * Abre modal para novo serviço
   */
  novoServico(): void {
    if (this.servicoModal) {
      this.servicoModal.show();
    } else {
      console.error('Modal não encontrado');
    }
  }

  /**
   * Abre modal para editar serviço
   */
  editarServico(servico: ServicoResponse): void {
    if (this.servicoModal) {
      this.servicoModal.show(servico);
    } else {
      console.error('Modal não encontrado');
    }
  }

  /**
   * Confirma e exclui um serviço
   */
  excluirServico(servico: ServicoResponse): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o serviço "${servico.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.executarExclusao(servico.id);
      }
    });
  }

  /**
   * Executa a exclusão do serviço
   */
  private executarExclusao(id: number): void {
    this.servicoService.excluirServico(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Serviço excluído com sucesso!',
            life: 3000
          });
          // Recarregar lista após exclusão
          setTimeout(() => {
            this.carregarServicos();
          }, 1000);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro!',
            detail: 'Erro ao excluir serviço. Tente novamente.',
            life: 5000
          });
        }
      });
  }

  /**
   * Formata o preço para exibição
   */
  formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  }

  /**
   * Formata a duração para exibição
   */
  formatarDuracao(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${mins}min`;
    }
    return `${mins}min`;
  }

  /**
   * Obtém a severidade do status do serviço
   */
  getStatusServico(servico: ServicoResponse): { label: string; severity: string } {
    // Por enquanto, todos os serviços são ativos
    return {
      label: 'Ativo',
      severity: 'success'
    };
  }

  /**
   * Obtém o nome da barbearia pelo ID
   */
  getNomeBarbearia(barbeariaId: number): string {
    const barbearia = this.opcoesBarbearia.find(opcao => opcao.value === barbeariaId);
    return barbearia ? barbearia.label : `Barbearia ${barbeariaId}`;
  }

  /**
   * Handler para mudança de página
   */
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  /**
   * Handler para ordenação
   */
  onSort(event: any): void {
    // Implementar ordenação se necessário
  }

  /**
   * Handler para serviço criado
   */
  onServicoCriado(): void {
    this.loading = true; // Forçar loading state
    setTimeout(() => {
      this.carregarServicos();
    }, 2000);
  }

  /**
   * Handler para serviço editado
   */
  onServicoEditado(): void {
    this.loading = true; // Forçar loading state
    setTimeout(() => {
      this.carregarServicos();
    }, 2000);
  }
} 