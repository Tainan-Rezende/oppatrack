import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActorCard } from './actor-card';

describe('ActorCard', () => {
  let component: ActorCard;
  let fixture: ComponentFixture<ActorCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActorCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ActorCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
