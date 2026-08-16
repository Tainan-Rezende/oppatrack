import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Drama } from '../../../models/drama.model';

@Component({
  selector: 'app-drama-card',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './drama-card.html',
  styleUrl: './drama-card.scss',
})
export class DramaCard {
  @Input({ required: true }) public drama!: Drama;
}