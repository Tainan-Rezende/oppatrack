import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  @Output() public closeModal = new EventEmitter<void>();

  constructor() { }

  public close(): void {
    this.closeModal.emit();
  }
}
