import { Component, inject, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Drama } from '../../models/home.model';
import { MOCK_DRAMAS } from '../mock/dramas.mock';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-drama-detail',
  imports: [CommonModule, DatePipe],
  templateUrl: './drama-detail.html',
  styleUrl: './drama-detail.scss',
})
export class DramaDetail implements OnInit {
  private route = inject(ActivatedRoute)

  public drama?: Drama

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if(id) {
      this.drama = MOCK_DRAMAS.find(item => item.id === id)
    }
  }
}
