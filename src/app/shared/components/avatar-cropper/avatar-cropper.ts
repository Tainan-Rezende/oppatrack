import { Component, input, output, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-avatar-cropper',
  imports: [CommonModule, ImageCropperComponent],
  templateUrl: './avatar-cropper.html',
  styleUrl: './avatar-cropper.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AvatarCropper {
  public imageFile = input.required<File>();
  public readonly cropConfirmed = output<Blob>();
  public readonly cropCancelled = output<void>();

  public croppedBlob = signal<Blob | null>(null);

  public onImageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.croppedBlob.set(event.blob);
    }
  }

  public confirmCrop(): void {
    const blob = this.croppedBlob();
    if (blob) {
      this.cropConfirmed.emit(blob);
    }
  }

  public cancel(): void {
    this.cropCancelled.emit();
  }
}