import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { houseIdFromUrl } from '../core/models/house.model';
import { HousesStore, SearchMode } from '../core/stores/houses.store';
import { FavoritesStore } from '../core/stores/favorites.store';

@Component({
  selector: 'app-houses-list',
  templateUrl: './houses-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
})
export class HousesListComponent implements OnInit {
  protected readonly store = inject(HousesStore);
  protected readonly favoritesStore = inject(FavoritesStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly houseIdFromUrl = houseIdFromUrl;
  protected readonly searchControl = new FormControl('');

  protected readonly houses = this.store.displayedHouses;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly pagination = this.store.pagination;
  protected readonly totalCount = this.store.displayTotalCount;
  protected readonly name = this.store.name;
  protected readonly searchMode = this.store.searchMode;

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pagination().pageSize)),
  );

  protected readonly pageNumbers = computed((): (number | -1)[] => {
    const total = this.totalPages();
    const current = this.pagination().currentPage;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | -1)[] = [1];
    if (current > 3) pages.push(-1);
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let p = start; p <= end; p++) pages.push(p);
    if (current < total - 2) pages.push(-1);
    pages.push(total);

    return pages;
  });

  ngOnInit(): void {
    this.store.loadHouses({ page: 1, pageSize: 10 });

    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        const term = value ?? '';
        if (this.searchMode() === 'partial') {
          this.store.setSearchName(term);
        } else {
          this.store.loadHouses({
            page: 1,
            pageSize: this.pagination().pageSize,
            name: term,
          });
        }
      });
  }

  protected onSearchModeChange(mode: SearchMode): void {
    this.store.setSearchMode(mode);
    const term = this.searchControl.value ?? '';
    if (term) {
      this.store.setSearchName(term);
    }
  }

  protected onPageChange(page: number): void {
    const { pageSize } = this.pagination();
    if (this.searchMode() === 'partial') {
      this.store.setContainsPage(page, pageSize);
    } else {
      this.store.loadHouses({ page, pageSize, name: this.name() });
    }
  }
}
