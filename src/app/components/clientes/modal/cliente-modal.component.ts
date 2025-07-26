import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { ClienteService } from '../../../services/cliente.service';

// DTOs
import { 
  ClienteResponse, 
  CriarClienteRequest, 
  UpdateClienteRequest,
  AtualizarClienteRequest
} from '../../../dto/cliente/cliente.dto';

@Component({
  selector: 'app-cliente-modal',
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
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.scss']
})
export class ClienteModalComponent implements OnInit, OnDestroy {
  visible = false;
  loading = false;
  clienteForm!: FormGroup;
  modoEdicao = false;
  clienteId: number | null = null;

  @Input() clienteParaEditar: ClienteResponse | null = null;
  @Output() clienteCriado = new EventEmitter<void>();
  @Output() clienteEditado = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  constructor(
    private clienteService: ClienteService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  show(cliente?: ClienteResponse): void {
    this.visible = true;
    
    if (cliente) {
      this.modoEdicao = true;
      this.clienteId = cliente.id;
      this.carregarDadosParaEdicao(cliente);
      this.atualizarValidacoes();
    } else {
      this.modoEdicao = false;
      this.clienteId = null;
      this.resetForm();
      this.atualizarValidacoes();
    }
  }

  hide(): void {
    this.visible = false;
    this.resetForm();
    this.modoEdicao = false;
    this.clienteId = null;
  }

  private initForm(): void {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required]],
      cpf: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      dataNascimento: [null, [Validators.required]]
    });
  }

  /**
   * Atualiza as validações do formulário baseado no modo (criação/edição)
   */
  private atualizarValidacoes(): void {
    const emailControl = this.clienteForm.get('email');
    
    if (this.modoEdicao) {
      // Na edição, email não é obrigatório (não é enviado no PUT)
      emailControl?.setValidators([Validators.email]);
    } else {
      // Na criação, email é obrigatório
      emailControl?.setValidators([Validators.required, Validators.email]);
    }
    
    emailControl?.updateValueAndValidity();
  }

  private resetForm(): void {
    this.clienteForm.reset();
    this.loading = false;
  }

  private carregarDadosParaEdicao(cliente: ClienteResponse): void {
    this.clienteForm.patchValue({
      nome: cliente.nome,
      cpf: cliente.cpf,
      telefone: cliente.telefone,
      email: cliente.email,
      dataNascimento: cliente.dataNascimento
    });
  }

  onSubmit(): void {
    if (this.clienteForm.valid) {
      this.loading = true;

      const formData = this.clienteForm.value;

      if (this.modoEdicao && this.clienteId) {
        // Modo edição usando PUT real
        // Formatar data para dd/MM/yyyy conforme swagger.json
        const dataFormatada = this.formatarDataParaAPI(formData.dataNascimento);
        
        const clienteData: AtualizarClienteRequest = {
          nome: formData.nome,
          cpf: formData.cpf,
          telefone: formData.telefone,
          dataNascimento: dataFormatada
        };

        this.clienteService.atualizarClienteComPut(this.clienteId, clienteData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.loading = false;
              
              // Toast de sucesso
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: `Cliente "${formData.nome}" atualizado com sucesso!`,
                life: 3000
              });

              // Fechar modal após 1 segundo para dar tempo do toast aparecer
              setTimeout(() => {
                this.hide();
                // Emitir evento para recarregar lista
                this.clienteEditado.emit();
              }, 1000);
            },
            error: (error) => {
              this.loading = false;
              
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao atualizar cliente. Tente novamente.',
                life: 5000
              });
            }
          });
      } else {
        // Modo criação
        const clienteData: CriarClienteRequest = {
          nome: formData.nome,
          cpf: formData.cpf,
          telefone: formData.telefone,
          email: formData.email,
          dataNascimento: formData.dataNascimento
        };

        this.clienteService.criarCliente(clienteData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.loading = false;
              
              // Toast de sucesso
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: `Cliente "${formData.nome}" cadastrado com sucesso!`,
                life: 3000
              });

              // Fechar modal após 1 segundo para dar tempo do toast aparecer
              setTimeout(() => {
                this.hide();
                // Emitir evento para recarregar lista
                this.clienteCriado.emit();
              }, 1000);
            },
            error: (error) => {
              this.loading = false;
              
              this.messageService.add({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao cadastrar cliente. Tente novamente.',
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
   * Formata a data para o formato dd/MM/yyyy conforme swagger.json
   */
  private formatarDataParaAPI(data: string | Date): string {
    if (!data) return '';
    
    try {
      const dataObj = new Date(data);
      const dia = dataObj.getDate().toString().padStart(2, '0');
      const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
      const ano = dataObj.getFullYear();
      
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      return '';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clienteForm.controls).forEach(key => {
      const control = this.clienteForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clienteForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.clienteForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  getMaxDate(): string {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }
} 