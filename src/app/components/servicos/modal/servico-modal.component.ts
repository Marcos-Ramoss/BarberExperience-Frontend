import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services
import { ServicoService } from '../../../services/servico.service';
import { BarbeariaService } from '../../../services/barbearia.service';

// DTOs
import { CriarServicoRequest, UpdateServicoRequest, AtualizarServicoRequest, ServicoResponse } from '../../../dto/servico/servico.dto';
import { BarbeariaResponse } from '../../../dto/barbearia/barbearia.dto';

@Component({
  selector: 'app-servico-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './servico-modal.component.html',
  styleUrls: ['./servico-modal.component.scss']
})
export class ServicoModalComponent implements OnInit, OnDestroy {
  visible = false;
  loading = false;
  servicoForm!: FormGroup;
  modoEdicao = false;
  servicoId: number | null = null;
  
  @Input() servicoParaEditar: ServicoResponse | null = null;
  @Output() servicoCriado = new EventEmitter<void>();
  @Output() servicoEditado = new EventEmitter<void>();
  
  private destroy$ = new Subject<void>();

  // Opções para duração
  opcoesDuracao = [
    { label: '15 minutos', value: 15 },
    { label: '30 minutos', value: 30 },
    { label: '45 minutos', value: 45 },
    { label: '1 hora', value: 60 },
    { label: '1h 15min', value: 75 },
    { label: '1h 30min', value: 90 },
    { label: '2 horas', value: 120 }
  ];

  // Opções para barbearias (carregadas do endpoint)
  opcoesBarbearia: { label: string; value: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private servicoService: ServicoService,
    private barbeariaService: BarbeariaService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.carregarBarbearias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  show(servico?: ServicoResponse): void {
    this.visible = true;
    
    if (servico) {
      this.modoEdicao = true;
      this.servicoId = servico.id;
      this.carregarDadosParaEdicao(servico);
    } else {
      this.modoEdicao = false;
      this.servicoId = null;
      this.resetForm();
    }
  }

  hide(): void {
    this.visible = false;
    this.resetForm();
    this.modoEdicao = false;
    this.servicoId = null;
  }

  private initForm(): void {
    this.servicoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descricao: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      preco: [null, [Validators.required, Validators.min(0.01)]],
      duracaoMinutos: [30, [Validators.required, Validators.min(1)]],
      barbeariaId: [1, [Validators.required]]
    });
  }

  private resetForm(): void {
    this.servicoForm.reset({
      duracaoMinutos: 30,
      barbeariaId: 1
    });
    this.loading = false;
  }

  private carregarDadosParaEdicao(servico: ServicoResponse): void {
    this.servicoForm.patchValue({
      nome: servico.nome,
      descricao: servico.descricao,
      preco: servico.preco,
      duracaoMinutos: servico.duracaoMinutos,
      barbeariaId: servico.barbeariaId
    });
  }

  private carregarBarbearias(): void {
    this.barbeariaService.carregarBarbearias()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (barbearias) => {
          this.opcoesBarbearia = barbearias.map(barbearia => ({
            label: barbearia.nome,
            value: barbearia.id
          }));
        },
        error: (error) => {
          console.error('Erro ao carregar barbearias:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro!',
            detail: 'Erro ao carregar lista de barbearias.',
            life: 5000
          });
        }
      });
  }

  onSubmit(): void {
    if (this.servicoForm.valid) {
      this.loading = true;
      
      const formData = this.servicoForm.value;
      
      if (this.modoEdicao && this.servicoId) {
        // Modo edição
        const servicoData: AtualizarServicoRequest = {
          nome: formData.nome,
          descricao: formData.descricao,
          preco: formData.preco,
          duracaoMinutos: formData.duracaoMinutos,
          barbeariaId: formData.barbeariaId
        };

        this.servicoService.atualizarServico(this.servicoId, servicoData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.loading = false;
              
              // Toast de sucesso
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: `Serviço "${formData.nome}" atualizado com sucesso!`,
                life: 3000
              });

              // Fechar modal após 1 segundo para dar tempo do toast aparecer
              setTimeout(() => {
                this.hide();
                // Emitir evento para recarregar lista
                this.servicoEditado.emit();
              }, 1000);
            },
            error: (error) => {
              this.loading = false;
              
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao atualizar serviço. Tente novamente.',
                life: 5000
              });
            }
          });
      } else {
        // Modo criação
        const servicoData: CriarServicoRequest = {
          nome: formData.nome,
          descricao: formData.descricao,
          preco: formData.preco,
          duracaoMinutos: formData.duracaoMinutos,
          barbeariaId: formData.barbeariaId
        };

        this.servicoService.criarServico(servicoData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.loading = false;
              
              // Toast de sucesso
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: `Serviço "${formData.nome}" cadastrado com sucesso!`,
                life: 3000
              });

              // Fechar modal após 1 segundo para dar tempo do toast aparecer
              setTimeout(() => {
                this.hide();
                // Emitir evento para recarregar lista
                this.servicoCriado.emit();
              }, 1000);
            },
            error: (error) => {
              this.loading = false;
              
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao cadastrar serviço. Tente novamente.',
                life: 5000
              });
            }
          });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.servicoForm.controls).forEach(key => {
      const control = this.servicoForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.servicoForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.servicoForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    }
    return '';
  }
} 