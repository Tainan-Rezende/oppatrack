import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DramaTrackerModal } from './drama-tracker-modal';

describe('DramaTrackerModal', () => {
  let component: DramaTrackerModal;
  let fixture: ComponentFixture<DramaTrackerModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DramaTrackerModal],
    }).compileComponents();

    fixture = TestBed.createComponent(DramaTrackerModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
