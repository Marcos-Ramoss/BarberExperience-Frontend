import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services
import { AgendamentoService } from '../../../services/agendamento.service';
import { ClienteService } from '../../../services/cliente.service';
import { ProfissionalService } from '../../../services/profissional.service';
import { ServicoService } from '../../../services/servico.service';
import { BarbeariaService } from '../../../services/barbearia.service';

// DTOs
import { 
  AgendamentoResponse, 
  CriarAgendamentoRequest, 
  AtualizarAgendamentoRequest,
  StatusAgendamento 
} from '../../../dto/agendamento/agendamento.dto';
import { ClienteResponse } from '../../../dto/cliente/cliente.dto';
import { ProfissionalResponse } from '../../../dto/profissional/profissional.dto';
import { ServicoResponse } from '../../../dto/servico/servico.dto';
import { BarbeariaResponse } from '../../../dto/barbearia/barbearia.dto';

@Component({
  selector: 'app-agendamento-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './agendamento-modal.component.html',
  styleUrls: ['./agendamento-modal.component.scss']
})
export class AgendamentoModalComponent implements OnInit, OnDestroy {
  @ViewChild('agendamentoModal') agendamentoModal: any;

  visible = false;
  loading = false;
  agendamentoForm!: FormGroup;
  modoEdicao = false;
  agendamentoId: number | null = null;

  // Dados para os dropdowns
  clientes: ClienteResponse[] = [];
  profissionais: ProfissionalResponse[] = [];
  servicos: ServicoResponse[] = [];
  barbearias: BarbeariaResponse[] = [];
  
  // Horário de funcionamento da barbearia selecionada
  horarioAbertura: string = '';
  horarioFechamento: string = '';
  barbeariaSelecionada: BarbeariaResponse | null = null;

  // Opções de status
  opcoesStatus = [
    { value: StatusAgendamento.PENDENTE, label: 'Pendente' },
    { value: StatusAgendamento.CONFIRMADO, label: 'Confirmado' },
    { value: StatusAgendamento.CANCELADO, label: 'Cancelado' },
    { value: StatusAgendamento.REALIZADO, label: 'Realizado' },
    { value: StatusAgendamento.AUSENTE, label: 'Ausente' }
  ];

  // Eventos
  @Output() agendamentoCriado = new EventEmitter<void>();
  @Output() agendamentoEditado = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  constructor(
    private agendamentoService: AgendamentoService,
    private clienteService: ClienteService,
    private profissionalService: ProfissionalService,
    private servicoService: ServicoService,
    private barbeariaService: BarbeariaService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Abre o modal
   */
  show(agendamento?: AgendamentoResponse): void {
    this.visible = true;
    
    if (agendamento) {
      this.modoEdicao = true;
      this.agendamentoId = agendamento.id;
      this.carregarDadosParaEdicao(agendamento);
    } else {
      this.modoEdicao = false;
      this.agendamentoId = null;
      this.resetForm();
    }
  }

  /**
   * Fecha o modal
   */
  hide(): void {
    this.visible = false;
    this.resetForm();
    this.modoEdicao = false;
    this.agendamentoId = null;
  }

  /**
   * Inicializa o formulário
   */
  private initForm(): void {
    this.agendamentoForm = this.fb.group({
      clienteId: [null, [Validators.required]],
      profissionalId: [null, [Validators.required]],
      barbeariaId: [null, [Validators.required]],
      servicoIds: [[], this.modoEdicao ? [] : [Validators.required]], // só required na criação
      servicoId: [null, this.modoEdicao ? [Validators.required] : []], // só required na edição
      horario: [null, [Validators.required, this.validarHorario.bind(this)]],
      status: [StatusAgendamento.PENDENTE, [Validators.required]]
    });

    // Listener para mudanças na barbearia
    this.agendamentoForm.get('barbeariaId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onBarbeariaChange();
      });
  }

  /**
   * Validador customizado para o campo de horário
   */
  validarHorario(control: AbstractControl): ValidationErrors | null {
    const horario = control.value;
    
    if (!horario || !this.barbeariaSelecionada || !this.horarioAbertura || !this.horarioFechamento) {
      return null; // Não valida se não há dados suficientes
    }
    
    if (!this.validarHorarioFuncionamento()) {
      return { horarioInvalido: true };
    }
    
    return null;
  }

  /**
   * Carrega dados para dropdowns
   */
  private carregarDados(): void {
    this.carregarClientes();
    this.carregarProfissionais();
    this.carregarServicos();
    this.carregarBarbearias();
  }

  /**
   * Carrega clientes
   */
  private carregarClientes(): void {
    this.clienteService.carregarClientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clientes) => {
          this.clientes = clientes;
        },
        error: (error) => {
          console.error('Erro ao carregar clientes:', error);
        }
      });
  }

  /**
   * Carrega profissionais
   */
  private carregarProfissionais(): void {
    this.profissionalService.carregarProfissionais()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profissionais) => {
          this.profissionais = profissionais;
        },
        error: (error) => {
          console.error('Erro ao carregar profissionais:', error);
        }
      });
  }

  /**
   * Carrega serviços
   */
  private carregarServicos(): void {
    this.servicoService.carregarServicos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (servicos) => {
          this.servicos = servicos;
        },
        error: (error) => {
          console.error('Erro ao carregar serviços:', error);
        }
      });
  }

  /**
   * Carrega barbearias
   */
  private carregarBarbearias(): void {
    this.barbeariaService.carregarBarbearias()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (barbearias) => {
          this.barbearias = barbearias;
        },
        error: (error) => {
          console.error('Erro ao carregar barbearias:', error);
        }
      });
  }

  /**
   * Carrega dados para edição
   */
  private carregarDadosParaEdicao(agendamento: AgendamentoResponse): void {
    this.agendamentoForm.patchValue({
      clienteId: agendamento.cliente.id,
      profissionalId: agendamento.profissional.id,
      barbeariaId: null, // Não disponível no response
      servicoIds: [], // não usado na edição
      servicoId: agendamento.servicos.length > 0 ? agendamento.servicos[0].id : null,
      horario: this.formatarDataParaInput(agendamento.horario),
      status: agendamento.status
    });
  }

  /**
   * Valida se o horário selecionado está dentro do horário de funcionamento
   */
  validarHorarioFuncionamento(): boolean {
    const horarioSelecionado = this.agendamentoForm.get('horario')?.value;
    
    if (!horarioSelecionado || !this.barbeariaSelecionada || !this.horarioAbertura || !this.horarioFechamento) {
      return true; // Se não há dados suficientes, não valida
    }
    
    try {
      const dataSelecionada = new Date(horarioSelecionado);
      const horaSelecionada = dataSelecionada.getHours();
      const minutoSelecionado = dataSelecionada.getMinutes();
      
      // Converter horários de funcionamento para comparação
      const [horaAbertura, minutoAbertura] = this.horarioAbertura.split(':').map(Number);
      const [horaFechamento, minutoFechamento] = this.horarioFechamento.split(':').map(Number);
      
      // Converter para minutos para facilitar comparação
      const minutosSelecionados = horaSelecionada * 60 + minutoSelecionado;
      const minutosAbertura = horaAbertura * 60 + minutoAbertura;
      const minutosFechamento = horaFechamento * 60 + minutoFechamento;
      
      return minutosSelecionados >= minutosAbertura && minutosSelecionados <= minutosFechamento;
    } catch (error) {
      return true; // Em caso de erro, não bloqueia
    }
  }

  /**
   * Submete o formulário
   */
  onSubmit(): void {
    if (this.agendamentoForm.valid) {
      // Validação adicional para serviços
      if (!this.modoEdicao) {
        const servicoIds = this.agendamentoForm.get('servicoIds')?.value;
        if (!servicoIds || servicoIds.length === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro!',
            detail: 'Selecione pelo menos um serviço.',
            life: 5000
          });
          return;
        }
      }
      
      // Validação de horário de funcionamento
      if (!this.validarHorarioFuncionamento()) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro!',
          detail: `O horário selecionado deve estar entre ${this.horarioAbertura} e ${this.horarioFechamento}.`,
          life: 5000
        });
        return;
      }
      
      this.loading = true;
      const formData = this.agendamentoForm.value;
      
      if (this.modoEdicao && this.agendamentoId) {
        // Modo edição: enviar servicoId único e dataHora
        const agendamentoData: AtualizarAgendamentoRequest = {
          dataHora: this.formatarDataParaAPI(formData.horario),
          clienteId: formData.clienteId,
          profissionalId: formData.profissionalId,
          servicoId: formData.servicoId, // único
          barbeariaId: formData.barbeariaId,
          status: formData.status
        };
        
        this.agendamentoService.atualizarAgendamento(this.agendamentoId, agendamentoData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.loading = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Agendamento atualizado com sucesso!',
                life: 3000
              });
              setTimeout(() => {
                this.hide();
                this.agendamentoEditado.emit();
              }, 1000);
            },
            error: (error) => {
              this.loading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao atualizar agendamento. Tente novamente.',
                life: 5000
              });
            }
          });
      } else {
        // Modo criação: enviar todos os campos conforme swagger.json
        const agendamentoData: CriarAgendamentoRequest = {
          clienteId: Number(formData.clienteId),
          profissionalId: Number(formData.profissionalId),
          barbeariaId: Number(formData.barbeariaId),
          servicoIds: formData.servicoIds.map((id: any) => Number(id)),
          horario: this.formatarDataParaAPI(formData.horario)
        };
        
        this.agendamentoService.criarAgendamento(agendamentoData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.loading = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Agendamento criado com sucesso!',
                life: 3000
              });
              setTimeout(() => {
                this.hide();
                this.agendamentoCriado.emit();
              }, 1000);
            },
            error: (error) => {
              console.error('Erro completo:', error);
              console.error('Status:', error.status);
              console.error('Mensagem:', error.message);
              console.error('Response:', error.error);
              this.loading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: `Erro ao criar agendamento: ${error.error?.message || error.message || 'Erro desconhecido'}`,
                life: 5000
              });
            }
          });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Formata a data para o formato da API
   */
  private formatarDataParaAPI(data: string): string {
    if (!data) return '';
    
    try {
      const date = new Date(data);
      // Formato: yyyy-MM-ddTHH:mm:ss (sem timezone)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return '';
    }
  }

  /**
   * Formata a data para o input datetime-local
   */
  private formatarDataParaInput(dataHora: string): string {
    if (!dataHora) return '';
    
    try {
      const date = new Date(dataHora);
      return date.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
    } catch (error) {
      return '';
    }
  }

  /**
   * Reseta o formulário
   */
  private resetForm(): void {
    this.agendamentoForm.reset({
      status: StatusAgendamento.PENDENTE
    });
    this.loading = false;
  }

  /**
   * Marca todos os campos como touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.agendamentoForm.controls).forEach(key => {
      const control = this.agendamentoForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verifica se um campo é inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.agendamentoForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  /**
   * Obtém o erro de um campo
   */
  getFieldError(fieldName: string): string {
    const field = this.agendamentoForm.get(fieldName);
    
    if (field?.errors) {
      if (field.errors['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors['minlength']) {
        return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['horarioInvalido']) {
        return `Horário deve estar entre ${this.horarioAbertura} e ${this.horarioFechamento}`;
      }
    }
    
    return '';
  }

  /**
   * Atualiza o horário de funcionamento quando uma barbearia é selecionada
   */
  onBarbeariaChange(): void {
    const barbeariaId = this.agendamentoForm.get('barbeariaId')?.value;
    
    if (barbeariaId) {
      // Buscar dados completos da barbearia pelo ID
      this.barbeariaService.buscarPorId(barbeariaId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (barbearia) => {
            this.barbeariaSelecionada = barbearia;
            
            if (barbearia.horarioFuncionamento) {
              this.horarioAbertura = barbearia.horarioFuncionamento.abertura || '';
              this.horarioFechamento = barbearia.horarioFuncionamento.fechamento || '';
            } else {
              // Fallback para horários padrão
              this.horarioAbertura = '08:00';
              this.horarioFechamento = '18:00';
            }
          },
          error: (error) => {
            // Fallback para horários padrão
            this.horarioAbertura = '08:00';
            this.horarioFechamento = '18:00';
          }
        });
    } else {
      this.barbeariaSelecionada = null;
      this.horarioAbertura = '';
      this.horarioFechamento = '';
    }
  }

  /**
   * Obtém a data mínima (hoje) como string para o input
   */
  getMinDateString(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }

  /**
   * Obtém a data máxima baseada no horário de fechamento da barbearia
   */
  getMaxDateString(): string {
    if (!this.barbeariaSelecionada || !this.horarioFechamento) {
      return '';
    }
    
    const hoje = new Date();
    const [horas, minutos] = this.horarioFechamento.split(':').map(Number);
    const dataMaxima = new Date(hoje);
    dataMaxima.setHours(horas, minutos, 0, 0);
    
    return dataMaxima.toISOString().slice(0, 16);
  }

  /**
   * Valida o horário selecionado em tempo real
   */
  onHorarioChange(): void {
    const horarioSelecionado = this.agendamentoForm.get('horario')?.value;
    
    if (horarioSelecionado && this.barbeariaSelecionada) {
      
      if (!this.validarHorarioFuncionamento()) {
        // Tentar ajustar o horário para o horário de abertura
        const dataSelecionada = new Date(horarioSelecionado);
        const [horaAbertura, minutoAbertura] = this.horarioAbertura.split(':').map(Number);
        
        // Manter a data, mas ajustar para o horário de abertura
        dataSelecionada.setHours(horaAbertura, minutoAbertura, 0, 0);
        
        const horarioAjustado = dataSelecionada.toISOString().slice(0, 16);
        
        // Atualizar o campo com o horário ajustado
        this.agendamentoForm.get('horario')?.setValue(horarioAjustado);
        
        this.messageService.add({
          severity: 'info',
          summary: 'Horário Ajustado',
          detail: `Horário ajustado para ${this.horarioAbertura} (horário de abertura)`,
          life: 3000
        });
      }
    }
  }

  /**
   * Verifica se um serviço está selecionado
   */
  isServicoSelected(servicoId: number): boolean {
    const servicoIds = this.agendamentoForm.get('servicoIds')?.value || [];
    return servicoIds.includes(servicoId);
  }

  /**
   * Alterna a seleção de um serviço
   */
  toggleServico(servicoId: number): void {
    const servicoIdsControl = this.agendamentoForm.get('servicoIds');
    const servicoIds = servicoIdsControl?.value || [];
    
    if (this.isServicoSelected(servicoId)) {
      const index = servicoIds.indexOf(servicoId);
      servicoIds.splice(index, 1);
    } else {
      servicoIds.push(servicoId);
    }
    
    servicoIdsControl?.setValue(servicoIds);
  }
} 