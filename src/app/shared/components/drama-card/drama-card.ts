import { Component, Input } from '@angular/core';
import { Drama } from '../../../models/home.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drama-card',
  imports: [CommonModule],
  templateUrl: './drama-card.html',
  styleUrl: './drama-card.scss',
})
export class DramaCard {
  @Input({required: true}) public drama!: Drama
}
