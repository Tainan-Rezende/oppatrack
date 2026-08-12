import { Component, Input } from '@angular/core';
import { Drama } from '../../../models/home.model';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-drama-card',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './drama-card.html',
  styleUrl: './drama-card.scss',
})
export class DramaCard {
  @Input({required: true}) public drama!: Drama
}
