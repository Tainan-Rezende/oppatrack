import { Component, inject, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Drama } from '../../models/drama.model';
import { DramaService } from '../../core/services/drama.service';

type DetailTab = 'info' | 'cast' | 'photos';

@Component({
  selector: 'app-drama-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './drama-detail.html',
  styleUrl: './drama-detail.scss',
})
export class DramaDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly dramaService = inject(DramaService);

  public drama = signal<Drama | null>(null);
  public isLoading = signal<boolean>(true);
  public activeTab = signal<DetailTab>('info');

  // Controle da Galeria Lightbox
  public selectedPhotoIndex = signal<number | null>(null);

  @HostListener('document:keydown', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.selectedPhotoIndex() === null) return;

    if (event.key === 'Escape') {
      this.closeGallery();
    } else if (event.key === 'ArrowLeft') {
      this.prevPhoto();
    } else if (event.key === 'ArrowRight') {
      this.nextPhoto();
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.dramaService.getDramaById(id).subscribe({
        next: (data) => {
          this.drama.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Erro ao buscar dorama da API:', err);
          this.isLoading.set(false);
        },
      });
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  public setTab(tab: DetailTab): void {
    this.activeTab.set(tab);
  }

  public openGallery(index: number): void {
    this.selectedPhotoIndex.set(index);
    document.body.style.overflow = 'hidden';
  }

  public closeGallery(): void {
    this.selectedPhotoIndex.set(null);
    document.body.style.overflow = '';
  }

  public prevPhoto(event?: Event): void {
    if (event) event.stopPropagation();
    const current = this.selectedPhotoIndex();
    const photos = this.drama()?.photos;
    if (current !== null && photos && photos.length > 0) {
      this.selectedPhotoIndex.set(current > 0 ? current - 1 : photos.length - 1);
    }
  }

  public nextPhoto(event?: Event): void {
    if (event) event.stopPropagation();
    const current = this.selectedPhotoIndex();
    const photos = this.drama()?.photos;
    if (current !== null && photos && photos.length > 0) {
      this.selectedPhotoIndex.set(current < photos.length - 1 ? current + 1 : 0);
    }
  }

  public async downloadPhoto(url: string, event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const currentIdx = (this.selectedPhotoIndex() ?? 0) + 1;
      link.download = `${this.drama()?.title || 'dorama'}-foto-${currentIdx}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  }
}