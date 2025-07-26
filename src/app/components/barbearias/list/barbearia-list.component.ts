import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

// Services
import { BarbeariaService } from '../../../services/barbearia.service';
import { BarbeariaResponse, BarbeariaFilter } from '../../../dto/barbearia/barbearia.dto';

@Component({
  selector: 'app-barbearia-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ProgressSpinnerModule,
    MessageModule,
    ConfirmDialogModule,
    TooltipModule,
    TagModule
  ],
  providers: [ConfirmationService],
  templateUrl: './barbearia-list.component.html',
  styleUrls: ['./barbearia-list.component.scss']
})
export class BarbeariaListComponent implements OnInit, OnDestroy {

  // Dados
  barbearias: BarbeariaResponse[] = [];
  barbeariasFiltradas: BarbeariaResponse[] = [];
  
  // Estados
  loading = false;
  error: string | null = null;
  
  // Filtros
  filtro: BarbeariaFilter = {};
  termoBusca = '';
  
  // Paginação
  first = 0;
  rows = 10;
  totalRecords = 0;
  
  // Opções de filtro
  opcoesEstado = [
    { label: 'Todos', value: null },
    { label: 'SP', value: 'SP' },
    { label: 'RJ', value: 'RJ' },
    { label: 'MG', value: 'MG' },
    { label: 'RS', value: 'RS' },
    { label: 'PR', value: 'PR' },
    { label: 'SC', value: 'SC' },
    { label: 'BA', value: 'BA' },
    { label: 'PE', value: 'PE' },
    { label: 'CE', value: 'CE' },
    { label: 'GO', value: 'GO' }
  ];

  opcoesStatus = [
    { label: 'Todas', value: null },
    { label: 'Ativas', value: true },
    { label: 'Inativas', value: false }
  ];

  // Destroy subject
  private destroy$ = new Subject<void>();

  constructor(
    private barbeariaService: BarbeariaService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.carregarBarbearias();
    this.subscribeToObservables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega as barbearias
   */
  carregarBarbearias(): void {
    this.barbeariaService.carregarBarbearias()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (barbearias) => {
          this.barbearias = barbearias;
          this.barbeariasFiltradas = barbearias;
          this.totalRecords = barbearias.length;
          this.aplicarFiltros();
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
    this.barbeariaService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    // Error
    this.barbeariaService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);
  }

  /**
   * Aplica os filtros na lista
   */
  aplicarFiltros(): void {
    let filtradas = [...this.barbearias];

    // Filtro por termo de busca
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      filtradas = filtradas.filter(barbearia => 
        barbearia.nome.toLowerCase().includes(termo) ||
        barbearia.endereco.cidade.toLowerCase().includes(termo) ||
        barbearia.email.toLowerCase().includes(termo)
      );
    }

    // Filtro por estado
    if (this.filtro.estado) {
      filtradas = filtradas.filter(barbearia => 
        barbearia.endereco.estado === this.filtro.estado
      );
    }

    // Filtro por cidade
    if (this.filtro.cidade) {
      filtradas = filtradas.filter(barbearia => 
        barbearia.endereco.cidade.toLowerCase().includes(this.filtro.cidade!.toLowerCase())
      );
    }

    this.barbeariasFiltradas = filtradas;
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
   * Navega para criar nova barbearia
   */
  novaBarbearia(): void {
    this.router.navigate(['/barbearias/nova']);
  }

  /**
   * Navega para editar barbearia
   */
  editarBarbearia(barbearia: BarbeariaResponse): void {
    this.router.navigate(['/barbearias/editar', barbearia.id]);
  }

  /**
   * Navega para visualizar detalhes da barbearia
   */
  visualizarBarbearia(barbearia: BarbeariaResponse): void {
    this.router.navigate(['/barbearias', barbearia.id]);
  }

  /**
   * Confirma exclusão da barbearia
   */
  confirmarExclusao(barbearia: BarbeariaResponse): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a barbearia "${barbearia.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.excluirBarbearia(barbearia.id);
      }
    });
  }

  /**
   * Exclui a barbearia
   */
  private excluirBarbearia(id: number): void {
    this.barbeariaService.excluirBarbearia(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // A lista já é atualizada automaticamente pelo service
          console.log('Barbearia excluída com sucesso');
        },
        error: (error) => {
          console.error('Erro ao excluir barbearia:', error);
        }
      });
  }

  /**
   * Formata o endereço completo
   */
  formatarEndereco(barbearia: BarbeariaResponse): string {
    const endereco = barbearia.endereco;
    return `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`;
  }

  /**
   * Formata o horário de funcionamento
   */
  formatarHorario(barbearia: BarbeariaResponse): string {
    const horario = barbearia.horarioFuncionamento;
    return `${horario.abertura} - ${horario.fechamento}`;
  }

  /**
   * Obtém o status da barbearia
   */
  getStatusBarbearia(barbearia: BarbeariaResponse): { label: string; severity: string } {
    // Por enquanto, todas as barbearias são consideradas ativas
    // No futuro, isso pode vir do backend
    return {
      label: 'Ativa',
      severity: 'success'
    };
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
    console.log('Ordenação:', event);
  }
} 