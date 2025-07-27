import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';

// Services
import { ProfissionalService } from '../../../services/profissional.service';
import { BarbeariaService } from '../../../services/barbearia.service';

// DTOs
import { CriarProfissionalRequest, UpdateProfissionalRequest, ProfissionalResponse, Especialidade } from '../../../dto/profissional/profissional.dto';
import { BarbeariaResponse } from '../../../dto/barbearia/barbearia.dto';

@Component({
  selector: 'app-profissional-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    InputMaskModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    ToastModule,
    MultiSelectModule
  ],
  providers: [MessageService],
  templateUrl: './profissional-modal.component.html',
  styleUrls: ['./profissional-modal.component.scss']
})
export class ProfissionalModalComponent implements OnInit, OnDestroy {
  visible = false;
  loading = false;
  profissionalForm!: FormGroup;
  modoEdicao = false;
  profissionalId: number | null = null;
  profissionalCriadoId: number | null = null; // ID do profissional recém-criado
  
  @Input() profissionalParaEditar: ProfissionalResponse | null = null;
  @Output() profissionalCriado = new EventEmitter<void>();
  @Output() profissionalEditado = new EventEmitter<void>();
  
  private destroy$ = new Subject<void>();

  // Dados para dropdowns
  barbearias: BarbeariaResponse[] = [];
  especialidades = [
    { label: 'Corte Masculino', value: 'CORTE_MASCULINO' },
    { label: 'Corte Feminino', value: 'CORTE_FEMININO' },
    { label: 'Barba', value: 'BARBA' },
    { label: 'Coloração', value: 'COLORACAO' },
    { label: 'Sobrancelha', value: 'SOBRANCELHA' }
  ];

  constructor(
    private fb: FormBuilder,
    private profissionalService: ProfissionalService,
    private barbeariaService: BarbeariaService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.carregarBarbearias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  show(profissional?: ProfissionalResponse): void {
    this.visible = true;
    this.profissionalCriadoId = null; // Reset do ID do profissional criado
    
    if (profissional) {
      this.modoEdicao = true;
      this.profissionalId = profissional.id;
      this.carregarDadosParaEdicao(profissional);
      
      // Remover validações obrigatórias dos campos de senha no modo edição
      this.profissionalForm.get('senha')?.clearValidators();
      this.profissionalForm.get('confirmarSenha')?.clearValidators();
      this.profissionalForm.get('senha')?.updateValueAndValidity();
      this.profissionalForm.get('confirmarSenha')?.updateValueAndValidity();
    } else {
      this.modoEdicao = false;
      this.profissionalId = null;
      this.resetForm();
      
      // Adicionar validações obrigatórias dos campos de senha no modo criação
      this.profissionalForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.profissionalForm.get('confirmarSenha')?.setValidators([Validators.required]);
      this.profissionalForm.get('senha')?.updateValueAndValidity();
      this.profissionalForm.get('confirmarSenha')?.updateValueAndValidity();
    }
  }

  hide(): void {
    this.visible = false;
    this.profissionalCriadoId = null; // Reset do ID do profissional criado
  }

  /**
   * Acessar dashboard do profissional recém-criado
   */
  acessarDashboard(): void {
    if (this.profissionalCriadoId) {
      this.router.navigate(['/dashboard-profissional'], { 
        queryParams: { profissionalId: this.profissionalCriadoId } 
      });
      this.hide();
    }
  }

  private initForm(): void {
    this.profissionalForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      especialidades: [[], [Validators.required, Validators.minLength(1)]],
      barbeariaId: ['', [Validators.required]],
      // Campos de senha (apenas para criação)
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    }, { validators: this.senhasIguaisValidator });
  }

  /**
   * Validador para verificar se as senhas são iguais
   */
  private senhasIguaisValidator(form: FormGroup): { [key: string]: any } | null {
    const senha = form.get('senha');
    const confirmarSenha = form.get('confirmarSenha');
    
    if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
      return { senhasDiferentes: true };
    }
    
    return null;
  }

  private resetForm(): void {
    this.profissionalForm.reset();
    this.profissionalForm.markAsUntouched();
    
    // Resetar validações de senha
    this.profissionalForm.get('senha')?.setErrors(null);
    this.profissionalForm.get('confirmarSenha')?.setErrors(null);
  }

  private carregarDadosParaEdicao(profissional: ProfissionalResponse): void {
    this.profissionalForm.patchValue({
      nome: profissional.nome,
      cpf: profissional.cpf,
      telefone: profissional.telefone,
      email: profissional.email,
      especialidades: profissional.especialidades,
      barbeariaId: profissional.barbeariaId
      // Não incluir senhas na edição
    });
  }

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

  onSubmit(): void {
    if (this.profissionalForm.valid) {
      this.loading = true;
      
      const formData = this.profissionalForm.value;
      
      if (this.modoEdicao && this.profissionalId) {
        // Modo edição
        const profissionalData: UpdateProfissionalRequest = {
          nome: formData.nome,
          cpf: formData.cpf,
          telefone: formData.telefone,
          email: formData.email,
          especialidades: formData.especialidades,
          barbeariaId: formData.barbeariaId
        };

        this.profissionalService.atualizarProfissional(this.profissionalId, profissionalData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.loading = false;
              
              // Toast de sucesso
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: `Profissional "${formData.nome}" atualizado com sucesso!`,
                life: 3000
              });

              // Fechar modal após 1 segundo para dar tempo do toast aparecer
              setTimeout(() => {
                this.hide();
                // Emitir evento para recarregar lista
                this.profissionalEditado.emit();
              }, 1000);
            },
            error: (error) => {
              this.loading = false;
              
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao atualizar profissional. Tente novamente.',
                life: 5000
              });
            }
          });
      } else {
        // Modo criação
        const profissionalData: CriarProfissionalRequest = {
          nome: formData.nome,
          cpf: formData.cpf,
          telefone: formData.telefone,
          email: formData.email,
          especialidades: formData.especialidades,
          barbeariaId: formData.barbeariaId,
          senha: formData.senha,
          confirmarSenha: formData.confirmarSenha
        };

        this.profissionalService.criarProfissional(profissionalData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.loading = false;
              this.profissionalCriadoId = response.id; // Armazena o ID do profissional criado
              
              // Toast de sucesso
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: `Profissional "${formData.nome}" cadastrado com sucesso!`,
                life: 3000
              });

              // Fechar modal após 1 segundo para dar tempo do toast aparecer
              setTimeout(() => {
                this.hide();
                // Emitir evento para recarregar lista
                this.profissionalCriado.emit();
              }, 1000);
            },
            error: (error) => {
              this.loading = false;
              
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao cadastrar profissional. Tente novamente.',
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
    Object.keys(this.profissionalForm.controls).forEach(key => {
      const control = this.profissionalForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profissionalForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profissionalForm.get(fieldName);
    
    if (field?.errors) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
    }
    
    // Validação específica para senhas diferentes
    if (this.profissionalForm.errors?.['senhasDiferentes'] && 
        (fieldName === 'senha' || fieldName === 'confirmarSenha')) {
      return 'As senhas não coincidem';
    }
    
    return '';
  }
} 