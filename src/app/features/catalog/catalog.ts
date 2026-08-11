import { Component } from '@angular/core';
import { Drama } from '../../models/home.model';
import { MOCK_DRAMAS } from '../mock/dramas.mock';
import { DramaCard } from '../../shared/components/drama-card/drama-card';

@Component({
  selector: 'app-catalog',
  imports: [DramaCard],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog {
  public dramaList: Drama[];

  constructor() {
    this.dramaList = MOCK_DRAMAS;
  }
}
