import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { House, houseIdFromUrl } from '../core/models/house.model';
import { HousesStore } from '../core/stores/houses.store';
import { FavoritesStore } from '../core/stores/favorites.store';
import { PaginationComponent } from '../shared/pagination/pagination';
import { SearchComponent } from '../shared/search/search';

@Component({
  selector: 'app-houses-list',
  templateUrl: './houses-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PaginationComponent, SearchComponent],
})
export class HousesListComponent implements OnInit {
  protected readonly store = inject(HousesStore);
  protected readonly favoritesStore = inject(FavoritesStore);

  protected readonly houseIdFromUrl = houseIdFromUrl;

  protected readonly houses = this.store.currentPageHouses;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly pagination = this.store.pagination;
  protected readonly autocompleteSuggestions = this.store.containsFiltered;

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.store.pagination().totalCount / this.pagination().pageSize)),
  );

  ngOnInit(): void {
    this.store.loadHouses({ page: 1, pageSize: 9 });
  }

  protected onSearchFocus(): void {
    if (!this.store.allHousesLoaded()) {
      this.store.loadAllHouses();
    }
  }

  protected onSearchChange(term: string): void {
    this.store.setSearchName(term);
    if (!term) {
      this.store.loadHouses({ page: 1, pageSize: this.pagination().pageSize });
    }
  }

  protected onSuggestionSelect(house: House): void {
    this.store.loadHouses({ page: 1, pageSize: this.pagination().pageSize, name: house.name });
  }

  protected onPageChange(page: number): void {
    this.store.loadHouses({ page, pageSize: this.pagination().pageSize, name: this.store.name() });
  }
}
