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
import { ConfirmationService, MessageService } from 'primeng/api';

// Services
import { ClienteService } from '../../../services/cliente.service';
import { ClienteResponse, ClienteFilter } from '../../../dto/cliente/cliente.dto';

// Components
import { ClienteModalComponent } from '../modal/cliente-modal.component';

@Component({
  selector: 'app-cliente-list',
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
    ClienteModalComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.scss']
})
export class ClienteListComponent implements OnInit, OnDestroy {
  @ViewChild('clienteModal') clienteModal!: ClienteModalComponent;

  // Dados
  clientes: ClienteResponse[] = [];
  clientesFiltradas: ClienteResponse[] = [];
  loading = false;
  error: string | null = null;

  // Filtros
  filtro: ClienteFilter = {};
  termoBusca = '';
  filtrosAplicados = false;

  // Paginação
  first = 0;
  rows = 10;
  totalRecords = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private clienteService: ClienteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega todos os clientes
   */
  carregarClientes(): void {
    this.loading = true;
    this.error = null;

    this.clienteService.carregarClientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clientes) => {
          this.clientes = clientes;
          this.clientesFiltradas = clientes;
          this.totalRecords = clientes.length;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao carregar clientes: ' + error.message;
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
    let filtradas = [...this.clientes];

    // Filtro por termo de busca
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      filtradas = filtradas.filter(cliente => 
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.email.toLowerCase().includes(termo) ||
        cliente.cpf.includes(termo)
      );
    }

    // Filtro por email
    if (this.filtro.email) {
      filtradas = filtradas.filter(cliente => 
        cliente.email.toLowerCase().includes(this.filtro.email!.toLowerCase())
      );
    }

    // Filtro por CPF
    if (this.filtro.cpf) {
      filtradas = filtradas.filter(cliente => 
        cliente.cpf.includes(this.filtro.cpf!)
      );
    }

    this.clientesFiltradas = filtradas;
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
    this.clientesFiltradas = [...this.clientes];
    this.totalRecords = this.clientes.length;
    this.first = 0;
    this.filtrosAplicados = false;
  }

  /**
   * Abre o modal para criar novo cliente
   */
  novoCliente(): void {
    this.clienteModal.show();
  }

  /**
   * Abre o modal para editar cliente
   */
  editarCliente(cliente: ClienteResponse): void {
    this.clienteModal.show(cliente);
  }

  /**
   * Confirma e exclui um cliente
   */
  excluirCliente(cliente: ClienteResponse): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o cliente "${cliente.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.clienteService.excluirCliente(cliente.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: `Cliente "${cliente.nome}" excluído com sucesso!`,
                life: 3000
              });
              // Recarregar lista após exclusão
              setTimeout(() => {
                this.carregarClientes();
              }, 1000);
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao excluir cliente. Tente novamente.',
                life: 5000
              });
            }
          });
      }
    });
  }

  /**
   * Formata a data de nascimento para exibição
   */
  formatarDataNascimento(dataNascimento: string): string {
    if (!dataNascimento) return 'N/A';
    
    try {
      const data = new Date(dataNascimento);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  }

  /**
   * Calcula a idade do cliente
   */
  calcularIdade(dataNascimento: string): number {
    if (!dataNascimento) return 0;
    
    try {
      const data = new Date(dataNascimento);
      const hoje = new Date();
      let idade = hoje.getFullYear() - data.getFullYear();
      const mes = hoje.getMonth() - data.getMonth();
      
      if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
        idade--;
      }
      
      return idade;
    } catch {
      return 0;
    }
  }

  /**
   * Handler para cliente criado
   */
  onClienteCriado(): void {
    this.loading = true;
    setTimeout(() => {
      this.carregarClientes();
    }, 2000);
  }

  /**
   * Handler para cliente editado
   */
  onClienteEditado(): void {
    this.loading = true;
    setTimeout(() => {
      this.carregarClientes();
    }, 2000);
  }
} 