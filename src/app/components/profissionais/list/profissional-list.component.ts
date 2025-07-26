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

// Services
import { ProfissionalService } from '../../../services/profissional.service';
import { BarbeariaService } from '../../../services/barbearia.service';

// DTOs
import { ProfissionalResponse, ProfissionalFilter, Especialidade } from '../../../dto/profissional/profissional.dto';
import { BarbeariaResponse } from '../../../dto/barbearia/barbearia.dto';

// Components
import { ProfissionalModalComponent } from '../modal/profissional-modal.component';

@Component({
  selector: 'app-profissional-list',
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
    ProfissionalModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './profissional-list.component.html',
  styleUrls: ['./profissional-list.component.scss']
})
export class ProfissionalListComponent implements OnInit, OnDestroy {
  @ViewChild('profissionalModal') profissionalModal!: ProfissionalModalComponent;

  // Dados
  profissionais: ProfissionalResponse[] = [];
  profissionaisFiltradas: ProfissionalResponse[] = [];
  barbearias: BarbeariaResponse[] = [];
  loading = false;
  error: string | null = null;

  // Filtros
  filtro: ProfissionalFilter = {};
  termoBusca = '';
  filtrosAplicados = false;

  // Paginação
  first = 0;
  rows = 10;
  totalRecords = 0;

  // Opções para dropdowns
  especialidades = [
    { label: 'Corte Masculino', value: 'CORTE_MASCULINO' },
    { label: 'Corte Feminino', value: 'CORTE_FEMININO' },
    { label: 'Barba', value: 'BARBA' },
    { label: 'Coloração', value: 'COLORACAO' },
    { label: 'Sobrancelha', value: 'SOBRANCELHA' }
  ];

  opcoesBarbearia: { label: string; value: number | null }[] = [
    { label: 'Todas as barbearias', value: null }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private profissionalService: ProfissionalService,
    private barbeariaService: BarbeariaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarBarbearias();
    this.carregarProfissionais();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
          // Popular opções do dropdown
          this.opcoesBarbearia = [
            { label: 'Todas as barbearias', value: null },
            ...barbearias.map(b => ({ label: b.nome, value: b.id }))
          ];
        },
        error: (error) => {
          console.error('Erro ao carregar barbearias:', error);
        }
      });
  }

  /**
   * Carrega todos os profissionais
   */
  carregarProfissionais(): void {
    this.loading = true;
    this.error = null;

    this.profissionalService.carregarProfissionais()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profissionais) => {
          this.profissionais = profissionais;
          this.profissionaisFiltradas = profissionais;
          this.totalRecords = profissionais.length;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao carregar profissionais: ' + error.message;
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
   * Aplica os filtros na lista
   */
  aplicarFiltros(): void {
    let filtradas = [...this.profissionais];

    // Filtro por termo de busca
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      filtradas = filtradas.filter(profissional => 
        profissional.nome.toLowerCase().includes(termo) ||
        profissional.email.toLowerCase().includes(termo) ||
        profissional.cpf.includes(termo)
      );
    }

    // Filtro por especialidade
    if (this.filtro.especialidade) {
      filtradas = filtradas.filter(profissional => 
        profissional.especialidades.includes(this.filtro.especialidade!)
      );
    }

    // Filtro por barbearia
    if (this.filtro.barbeariaId) {
      filtradas = filtradas.filter(profissional => 
        profissional.barbeariaId === this.filtro.barbeariaId
      );
    }

    this.profissionaisFiltradas = filtradas;
    this.totalRecords = filtradas.length;
    this.first = 0; // Reset para primeira página
    this.filtrosAplicados = Object.keys(this.filtro).length > 0 || this.termoBusca.trim() !== '';
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
   * Abre o modal para criar novo profissional
   */
  novoProfissional(): void {
    this.profissionalModal.show();
  }

  /**
   * Abre o modal para editar profissional
   */
  editarProfissional(profissional: ProfissionalResponse): void {
    this.profissionalModal.show(profissional);
  }

  /**
   * Confirma e exclui um profissional
   */
  excluirProfissional(profissional: ProfissionalResponse): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o profissional "${profissional.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.profissionalService.excluirProfissional(profissional.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: `Profissional "${profissional.nome}" excluído com sucesso!`,
                life: 3000
              });
              // Recarregar lista após exclusão
              setTimeout(() => {
                this.carregarProfissionais();
              }, 1000);
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao excluir profissional. Tente novamente.',
                life: 5000
              });
            }
          });
      }
    });
  }

  /**
   * Obtém o nome da barbearia pelo ID
   */
  getNomeBarbearia(barbeariaId: number): string {
    const barbearia = this.barbearias.find(b => b.id === barbeariaId);
    return barbearia ? barbearia.nome : 'N/A';
  }

  /**
   * Formata as especialidades para exibição
   */
  formatarEspecialidades(especialidades: string[]): string {
    return especialidades.map(esp => {
      const especialidade = this.especialidades.find(e => e.value === esp);
      return especialidade ? especialidade.label : esp;
    }).join(', ');
  }

  /**
   * Handler para profissional criado
   */
  onProfissionalCriado(): void {
    this.loading = true;
    setTimeout(() => {
      this.carregarProfissionais();
    }, 2000);
  }

  /**
   * Handler para profissional editado
   */
  onProfissionalEditado(): void {
    this.loading = true;
    setTimeout(() => {
      this.carregarProfissionais();
    }, 2000);
  }
} 