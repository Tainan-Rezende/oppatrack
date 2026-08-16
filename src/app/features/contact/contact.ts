import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  public name = signal<string>('');
  public email = signal<string>('');
  public subject = signal<string>('sugestao');
  public message = signal<string>('');
  public isSubmitted = signal<boolean>(false);
  public isSending = signal<boolean>(false);

  public onSubmit(): void {
    if (!this.name() || !this.email() || !this.message()) return;

    this.isSending.set(true);

    // Simulação de envio rápido
    setTimeout(() => {
      this.isSending.set(false);
      this.isSubmitted.set(true);
      this.name.set('');
      this.email.set('');
      this.message.set('');
    }, 800);
  }
}