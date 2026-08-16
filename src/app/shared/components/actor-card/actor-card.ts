import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActorSummary } from '../../../models/actor.model';

@Component({
  selector: 'app-actor-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './actor-card.html',
  styleUrl: './actor-card.scss',
})
export class ActorCard {
  @Input({ required: true }) public actor!: ActorSummary;
}