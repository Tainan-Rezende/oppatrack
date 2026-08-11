import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DramaCard } from './drama-card';

describe('DramaCard', () => {
  let component: DramaCard;
  let fixture: ComponentFixture<DramaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DramaCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DramaCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
