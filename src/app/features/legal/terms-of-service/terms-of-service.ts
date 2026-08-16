import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-of-service',
  imports: [CommonModule],
  templateUrl: './terms-of-service.html',
  styleUrl: './terms-of-service.scss',
})
export class TermsOfService {
  public lastUpdated = 'Agosto de 2026';
}