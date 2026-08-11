import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  @Output() public closeModal = new EventEmitter<void>();
  public token: string;

  constructor() {
    this.token = '';
  }

  public close(): void {
    this.closeModal.emit();
  }

  public onTokenInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const onlyNumbers = inputElement.value.replace(/\D/g, '');

    this.token = onlyNumbers;
    inputElement.value = onlyNumbers;
  }
}
