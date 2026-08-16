import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;

  @Output() pageChange = new EventEmitter<number>();

  // Gera a régua de páginas inteligente (ex: 1 ... 4 5 6 ... 50)
  public pages = computed(() => {
    const current = this.currentPage;
    const total = this.totalPages;
    const delta = 2; // Quantidade de páginas adjacentes visíveis

    if (total <= 1) return [];

    const range: (number | string)[] = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);

    if (left > 2) {
      range.push('...');
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < total - 1) {
      range.push('...');
    }

    if (total > 1) {
      range.push(total);
    }

    return range;
  });

  public selectPage(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  public prevPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  public nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}