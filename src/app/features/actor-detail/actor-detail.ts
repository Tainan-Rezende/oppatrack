import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DramaService } from '../../core/services/drama.service';
import { ActorDetailModel } from '../../models/actor.model';
import { DramaCard } from '../../shared/components/drama-card/drama-card';

@Component({
  selector: 'app-actor-detail',
  imports: [CommonModule, DramaCard],
  templateUrl: './actor-detail.html',
  styleUrl: './actor-detail.scss',
})
export class ActorDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dramaService = inject(DramaService);

  public actor = signal<ActorDetailModel | null>(null);
  public isLoading = signal<boolean>(true);

  // 🖼️ Estado do Lightbox / Modal de Fotos
  public activePhotoIndex = signal<number | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dramaService.getActorById(id).subscribe({
        next: (data) => {
          this.actor.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Erro ao buscar detalhes do ator:', err);
          this.isLoading.set(false);
        },
      });
    }
  }

  // Controles do Lightbox
  public openLightbox(index: number): void {
    this.activePhotoIndex.set(index);
    document.body.style.overflow = 'hidden'; // Trava scroll da página de fundo
  }

  public closeLightbox(): void {
    this.activePhotoIndex.set(null);
    document.body.style.overflow = '';
  }

  public nextPhoto(event?: Event): void {
    event?.stopPropagation();
    const photos = this.actor()?.photos || [];
    const current = this.activePhotoIndex();
    if (current !== null && current < photos.length - 1) {
      this.activePhotoIndex.set(current + 1);
    }
  }

  public prevPhoto(event?: Event): void {
    event?.stopPropagation();
    const current = this.activePhotoIndex();
    if (current !== null && current > 0) {
      this.activePhotoIndex.set(current - 1);
    }
  }

  // Atalhos de Teclado
  @HostListener('window:keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    if (this.activePhotoIndex() === null) return;
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowRight') this.nextPhoto();
    if (event.key === 'ArrowLeft') this.prevPhoto();
  }

  // Download da Foto em Alta Resolução
  public async downloadPhoto(photoUrl: string, actorName: string, event?: Event): Promise<void> {
    event?.stopPropagation();
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${actorName.toLowerCase().replace(/\s+/g, '-')}-foto-${(this.activePhotoIndex() ?? 0) + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(photoUrl, '_blank');
    }
  }
}