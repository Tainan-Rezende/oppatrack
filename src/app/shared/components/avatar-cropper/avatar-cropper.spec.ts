import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarCropper } from './avatar-cropper';

describe('AvatarCropper', () => {
  let component: AvatarCropper;
  let fixture: ComponentFixture<AvatarCropper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarCropper],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarCropper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
