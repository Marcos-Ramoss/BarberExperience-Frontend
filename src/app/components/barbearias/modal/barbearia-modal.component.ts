import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
import { MessageService } from 'primeng/api';

// Services
import { BarbeariaService } from '../../../services/barbearia.service';

// DTOs
import { CriarBarbeariaRequest, UpdateBarbeariaRequest, BarbeariaResponse } from '../../../dto/barbearia/barbearia.dto';

@Component({
  selector: 'app-barbearia-modal',
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
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './barbearia-modal.component.html',
  styleUrls: ['./barbearia-modal.component.scss']
})
export class BarbeariaModalComponent implements OnInit, OnDestroy {
  visible = false;
  loading = false;
  barbeariaForm!: FormGroup;
  modoEdicao = false;
  barbeariaId: number | null = null;
  
  @Input() barbeariaParaEditar: BarbeariaResponse | null = null;
  @Output() barbeariaCriada = new EventEmitter<void>();
  @Output() barbeariaEditada = new EventEmitter<void>();
  
  private destroy$ = new Subject<void>();

  // Estados brasileiros
  estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Horários de funcionamento
  horarios = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00', '23:00', '00:00'
  ];

  constructor(
    private fb: FormBuilder,
    private barbeariaService: BarbeariaService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  show(barbearia?: BarbeariaResponse): void {
    this.visible = true;
    
    if (barbearia) {
      this.modoEdicao = true;
      this.barbeariaId = barbearia.id;
      this.carregarDadosParaEdicao(barbearia);
    } else {
      this.modoEdicao = false;
      this.barbeariaId = null;
      this.resetForm();
    }
  }

  hide(): void {
    this.visible = false;
    this.resetForm();
    this.modoEdicao = false;
    this.barbeariaId = null;
  }

  private initForm(): void {
    this.barbeariaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      cnpj: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      rua: ['', [Validators.required, Validators.minLength(3)]],
      numero: ['', [Validators.required]],
      bairro: ['', [Validators.required, Validators.minLength(3)]],
      cidade: ['', [Validators.required, Validators.minLength(3)]],
      estado: ['', [Validators.required]],
      cep: ['', [Validators.required]],
      horaAbertura: ['08:00', [Validators.required]],
      horaFechamento: ['18:00', [Validators.required]]
    });
  }

  private resetForm(): void {
    this.barbeariaForm.reset({
      horaAbertura: '08:00',
      horaFechamento: '18:00'
    });
    this.loading = false;
  }

  private carregarDadosParaEdicao(barbearia: BarbeariaResponse): void {
    this.barbeariaForm.patchValue({
      nome: barbearia.nome,
      cnpj: barbearia.cnpj,
      telefone: barbearia.telefone,
      email: barbearia.email,
      rua: barbearia.endereco.rua,
      numero: barbearia.endereco.numero,
      bairro: barbearia.endereco.bairro,
      cidade: barbearia.endereco.cidade,
      estado: barbearia.endereco.estado,
      cep: barbearia.endereco.cep,
      horaAbertura: barbearia.horarioFuncionamento.abertura,
      horaFechamento: barbearia.horarioFuncionamento.fechamento
    });
  }

  onSubmit(): void {
    if (this.barbeariaForm.valid) {
      this.loading = true;
      
      const formData = this.barbeariaForm.value;
      
      if (this.modoEdicao && this.barbeariaId) {
        // Modo edição
        const barbeariaData: UpdateBarbeariaRequest = {
          nome: formData.nome,
          cnpj: formData.cnpj,
          telefone: formData.telefone,
          email: formData.email,
          rua: formData.rua,
          numero: formData.numero,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep,
          horaAbertura: formData.horaAbertura,
          horaFechamento: formData.horaFechamento
        };

        this.barbeariaService.atualizarBarbearia(this.barbeariaId, barbeariaData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.loading = false;
              
              // Toast de sucesso
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: `Barbearia "${formData.nome}" atualizada com sucesso!`,
                life: 3000
              });

              // Fechar modal após 1 segundo para dar tempo do toast aparecer
              setTimeout(() => {
                this.hide();
                // Emitir evento para recarregar lista
                this.barbeariaEditada.emit();
              }, 1000);
            },
            error: (error) => {
              this.loading = false;
              
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao atualizar barbearia. Tente novamente.',
                life: 5000
              });
            }
          });
      } else {
        // Modo criação
        const barbeariaData: CriarBarbeariaRequest = {
          nome: formData.nome,
          cnpj: formData.cnpj,
          telefone: formData.telefone,
          email: formData.email,
          rua: formData.rua,
          numero: formData.numero,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep,
          horaAbertura: formData.horaAbertura,
          horaFechamento: formData.horaFechamento
        };

        this.barbeariaService.criarBarbearia(barbeariaData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.loading = false;
              
              // Toast de sucesso
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: `Barbearia "${formData.nome}" cadastrada com sucesso!`,
                life: 3000
              });

              // Fechar modal após 1 segundo para dar tempo do toast aparecer
              setTimeout(() => {
                this.hide();
                // Emitir evento para recarregar lista
                this.barbeariaCriada.emit();
              }, 1000);
            },
            error: (error) => {
              this.loading = false;
              
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao cadastrar barbearia. Tente novamente.',
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
    Object.keys(this.barbeariaForm.controls).forEach(key => {
      const control = this.barbeariaForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.barbeariaForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.barbeariaForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }
} 