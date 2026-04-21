import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { House, houseIdFromUrl } from '../core/models/house.model';
import { HousesStore } from '../core/stores/houses.store';
import { FavoritesStore } from '../core/stores/favorites.store';
import { PaginationComponent } from '../shared/pagination/pagination';

@Component({
  selector: 'app-houses-list',
  templateUrl: './houses-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, PaginationComponent],
})
export class HousesListComponent implements OnInit {
  protected readonly store = inject(HousesStore);
  protected readonly favoritesStore = inject(FavoritesStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly houseIdFromUrl = houseIdFromUrl;
  protected readonly searchControl = new FormControl('');
  protected readonly showDropdown = signal(false);

  protected readonly houses = this.store.currentPageHouses;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly pagination = this.store.pagination;
  protected readonly totalCount = computed(() => this.store.pagination().totalCount);
  protected readonly autocompleteSuggestions = this.store.containsFiltered;

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pagination().pageSize)),
  );

  ngOnInit(): void {
    this.store.loadHouses({ page: 1, pageSize: 9 });

    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        const term = value ?? '';
        this.store.setSearchName(term);
        this.showDropdown.set(!!term.trim());
        if (!term.trim()) {
          this.store.loadHouses({ page: 1, pageSize: this.pagination().pageSize });
        }
      });
  }

  protected onSearchFocus(): void {
    if (!this.store.allHousesLoaded()) {
      this.store.loadAllHouses();
    }
    if (this.searchControl.value?.trim()) {
      this.showDropdown.set(true);
    }
  }

  protected onSearchBlur(): void {
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  protected onSuggestionSelect(house: House): void {
    this.showDropdown.set(false);
    this.searchControl.setValue(house.name, { emitEvent: false });
    this.store.loadHouses({ page: 1, pageSize: this.pagination().pageSize, name: house.name });
  }

  protected onPageChange(page: number): void {
    this.store.loadHouses({ page, pageSize: this.pagination().pageSize, name: this.store.name() });
  }
}
