import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../../services/auth.service';
import { LoginRequestDto } from '../../../dto/auth/login.dto';

/**
 * Componente de login
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    RippleModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  checked: boolean = false;
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscribeToAuthState();
  }

  /**
   * Inscrever-se no estado de autenticação
   */
  private subscribeToAuthState(): void {
    this.authService.loading$.subscribe(loading => {
      this.loading = loading;
    });

    this.authService.error$.subscribe(error => {
      this.errorMessage = error || '';
    });
  }

  /**
   * Realizar login
   */
  onSubmit(): void {
    if (this.email && this.password) {
      const credentials: LoginRequestDto = {
        username: this.email,
        password: this.password
      };
      this.authService.login(credentials).subscribe();
    }
  }

  /**
   * Navegar para registro
   */
  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Navegar para recuperação de senha
   */
  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
} 