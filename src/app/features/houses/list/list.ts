import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { House, houseIdFromUrl } from '../../../core/models/house.model';
import { HousesStore } from '../../../core/stores/houses.store';
import { FavoritesStore } from '../../../core/stores/favorites.store';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { SearchComponent } from '../../../shared/search/search';
import { HouseCardComponent } from '../../../shared/house-card/house-card';

@Component({
  selector: 'app-houses-list',
  templateUrl: './list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginationComponent, SearchComponent, HouseCardComponent],
})
export class HousesListComponent implements OnInit {
  protected readonly housesStore = inject(HousesStore);
  protected readonly favoritesStore = inject(FavoritesStore);

  protected readonly houseIdFromUrl = houseIdFromUrl;

  protected readonly houses = this.housesStore.currentPageHouses;
  protected readonly loading = this.housesStore.loading;
  protected readonly error = this.housesStore.error;
  protected readonly pagination = this.housesStore.pagination;
  protected readonly autocompleteSuggestions = this.housesStore.containsFiltered;

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.housesStore.pagination().totalCount / this.pagination().pageSize)),
  );

  ngOnInit(): void {
    this.housesStore.loadHouses({ page: 1, pageSize: 9 });
  }

  protected onSearchFocus(): void {
    if (!this.housesStore.allHousesLoaded()) {
      this.housesStore.loadAllHouses();
    }
  }

  protected onSearchChange(term: string): void {
    this.housesStore.setSearchName(term);
    if (!term) {
      this.housesStore.loadHouses({ page: 1, pageSize: this.pagination().pageSize });
    }
  }

  protected onSuggestionSelect(house: House): void {
    this.housesStore.loadHouses({ page: 1, pageSize: this.pagination().pageSize, name: house.name });
  }

  protected onPageChange(page: number): void {
    this.housesStore.loadHouses({ page, pageSize: this.pagination().pageSize, name: this.housesStore.name() });
  }
}
