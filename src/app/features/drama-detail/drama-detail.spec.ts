import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DramaDetail } from './drama-detail';

describe('DramaDetail', () => {
  let component: DramaDetail;
  let fixture: ComponentFixture<DramaDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DramaDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(DramaDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
