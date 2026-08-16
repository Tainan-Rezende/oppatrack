import { Component, HostListener, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type AuthView = 'login' | 'register' | 'recover';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly closeModal = output<void>();

  public currentView = signal<AuthView>('login');
  public isSubmitting = signal<boolean>(false);
  public isClosing = signal<boolean>(false);
  public showPassword = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  // Campos de Login
  public identifier = signal<string>('');
  public password = signal<string>('');

  // Campos de Cadastro
  public regName = signal<string>('');
  public regEmail = signal<string>('');
  public regPassword = signal<string>('');
  public registeredProfileCode = signal<string | null>(null);

  // Campo de Recuperação
  public recoverEmail = signal<string>('');
  public recoverySuccess = signal<boolean>(false);

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this.close();
  }

  // Fecha de forma suave com animação reversa
  public close(): void {
    if (this.isClosing()) return;
    this.isClosing.set(true);
    setTimeout(() => {
      this.closeModal.emit();
    }, 220); // Duração sincronizada com a animação SCSS
  }

  public switchView(view: AuthView): void {
    this.currentView.set(view);
    this.errorMessage.set(null);
    this.recoverySuccess.set(false);
    this.registeredProfileCode.set(null);
  }

  public togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  public async onSubmitLogin(): Promise<void> {
    if (!this.identifier().trim() || this.password().length < 6 || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.login(this.identifier(), this.password());
      this.close();
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'E-mail, código ou senha incorretos.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public async onSubmitRegister(): Promise<void> {
    if (
      !this.regName().trim() ||
      !this.regEmail().trim() ||
      this.regPassword().length < 6 ||
      this.isSubmitting()
    ) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const { profileCode } = await this.authService.register(
        this.regName(),
        this.regEmail(),
        this.regPassword()
      );
      this.registeredProfileCode.set(profileCode);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Erro ao criar perfil. Tente outro e-mail.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public async onSubmitRecover(): Promise<void> {
    if (!this.recoverEmail().trim() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.recoverPassword(this.recoverEmail());
      this.recoverySuccess.set(true);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Não foi possível enviar o e-mail de recuperação.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}