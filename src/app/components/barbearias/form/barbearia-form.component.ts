import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

// Serviços e DTOs
import { BarbeariaService } from '../../../services/barbearia.service';
import { 
  BarbeariaResponse, 
  CriarBarbeariaRequest, 
  UpdateBarbeariaRequest 
} from '../../../dto/barbearia/barbearia.dto';

@Component({
  selector: 'app-barbearia-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputMaskModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './barbearia-form.component.html',
  styleUrls: ['./barbearia-form.component.scss']
})
export class BarbeariaFormComponent implements OnInit, OnDestroy {

  // Formulário
  barbeariaForm!: FormGroup;
  
  // Estado
  loading = false;
  error: string | null = null;
  isEditMode = false;
  barbeariaId: number | null = null;
  
  // Estados brasileiros
  estados = [
    { label: 'Acre', value: 'AC' },
    { label: 'Alagoas', value: 'AL' },
    { label: 'Amapá', value: 'AP' },
    { label: 'Amazonas', value: 'AM' },
    { label: 'Bahia', value: 'BA' },
    { label: 'Ceará', value: 'CE' },
    { label: 'Distrito Federal', value: 'DF' },
    { label: 'Espírito Santo', value: 'ES' },
    { label: 'Goiás', value: 'GO' },
    { label: 'Maranhão', value: 'MA' },
    { label: 'Mato Grosso', value: 'MT' },
    { label: 'Mato Grosso do Sul', value: 'MS' },
    { label: 'Minas Gerais', value: 'MG' },
    { label: 'Pará', value: 'PA' },
    { label: 'Paraíba', value: 'PB' },
    { label: 'Paraná', value: 'PR' },
    { label: 'Pernambuco', value: 'PE' },
    { label: 'Piauí', value: 'PI' },
    { label: 'Rio de Janeiro', value: 'RJ' },
    { label: 'Rio Grande do Norte', value: 'RN' },
    { label: 'Rio Grande do Sul', value: 'RS' },
    { label: 'Rondônia', value: 'RO' },
    { label: 'Roraima', value: 'RR' },
    { label: 'Santa Catarina', value: 'SC' },
    { label: 'São Paulo', value: 'SP' },
    { label: 'Sergipe', value: 'SE' },
    { label: 'Tocantins', value: 'TO' }
  ];

  // Horários de funcionamento
  horarios = [
    { label: '06:00', value: '06:00' },
    { label: '07:00', value: '07:00' },
    { label: '08:00', value: '08:00' },
    { label: '09:00', value: '09:00' },
    { label: '10:00', value: '10:00' },
    { label: '11:00', value: '11:00' },
    { label: '12:00', value: '12:00' },
    { label: '13:00', value: '13:00' },
    { label: '14:00', value: '14:00' },
    { label: '15:00', value: '15:00' },
    { label: '16:00', value: '16:00' },
    { label: '17:00', value: '17:00' },
    { label: '18:00', value: '18:00' },
    { label: '19:00', value: '19:00' },
    { label: '20:00', value: '20:00' },
    { label: '21:00', value: '21:00' },
    { label: '22:00', value: '22:00' },
    { label: '23:00', value: '23:00' },
    { label: '00:00', value: '00:00' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private barbeariaService: BarbeariaService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializar formulário
   */
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

  /**
   * Verificar se está em modo de edição
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditMode = true;
      this.barbeariaId = +id;
      this.loadBarbearia(this.barbeariaId);
    }
  }

  /**
   * Carregar barbearia para edição
   */
  private loadBarbearia(id: number): void {
    this.loading = true;
    this.error = null;

    this.barbeariaService.buscarPorId(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (barbearia) => {
          this.populateForm(barbearia);
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao carregar barbearia: ' + error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Preencher formulário com dados da barbearia
   */
  private populateForm(barbearia: BarbeariaResponse): void {
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

  /**
   * Salvar barbearia
   */
  onSubmit(): void {
    if (this.barbeariaForm.valid) {
      this.loading = true;
      this.error = null;

      const formValue = this.barbeariaForm.value;
      
      if (this.isEditMode && this.barbeariaId) {
        this.updateBarbearia(formValue);
      } else {
        this.createBarbearia(formValue);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Criar nova barbearia
   */
  private createBarbearia(formValue: any): void {
    const request: CriarBarbeariaRequest = {
      nome: formValue.nome,
      cnpj: formValue.cnpj,
      telefone: formValue.telefone,
      email: formValue.email,
      rua: formValue.rua,
      numero: formValue.numero,
      bairro: formValue.bairro,
      cidade: formValue.cidade,
      estado: formValue.estado,
      cep: formValue.cep,
      horaAbertura: formValue.horaAbertura,
      horaFechamento: formValue.horaFechamento
    };

    this.barbeariaService.criarBarbearia(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/barbearias']);
        },
        error: (error) => {
          this.error = 'Erro ao criar barbearia: ' + error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Atualizar barbearia existente
   */
  private updateBarbearia(formValue: any): void {
    const request: UpdateBarbeariaRequest = {
      nome: formValue.nome,
      cnpj: formValue.cnpj,
      telefone: formValue.telefone,
      email: formValue.email,
      rua: formValue.rua,
      numero: formValue.numero,
      bairro: formValue.bairro,
      cidade: formValue.cidade,
      estado: formValue.estado,
      cep: formValue.cep,
      horaAbertura: formValue.horaAbertura,
      horaFechamento: formValue.horaFechamento
    };

    this.barbeariaService.atualizarBarbearia(this.barbeariaId!, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/barbearias']);
        },
        error: (error) => {
          this.error = 'Erro ao atualizar barbearia: ' + error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Cancelar operação
   */
  onCancel(): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja cancelar? As alterações serão perdidas.',
      accept: () => {
        this.router.navigate(['/barbearias']);
      }
    });
  }

  /**
   * Marcar todos os campos como touched para mostrar erros
   */
  private markFormGroupTouched(): void {
    Object.keys(this.barbeariaForm.controls).forEach(key => {
      const control = this.barbeariaForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar se campo é inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.barbeariaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obter mensagem de erro do campo
   */
  getFieldError(fieldName: string): string {
    const field = this.barbeariaForm.get(fieldName);
    
    if (field?.errors) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    
    return '';
  }
} 