import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { House, houseIdFromUrl } from '../../../core/models/house.model';
import { HousesStore } from '../../../core/stores/houses.store';
import { FavoritesStore } from '../../../core/stores/favorites.store';
import { HouseCardComponent } from '../../../shared/house-card/house-card';

@Component({
  selector: 'app-favorites-list',
  templateUrl: './favorites-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HouseCardComponent],
})
export class FavoritesListComponent {
  protected readonly favoritesStore = inject(FavoritesStore);
  protected readonly housesStore = inject(HousesStore);
  protected readonly houseIdFromUrl = houseIdFromUrl;

  protected readonly favoriteHouses = computed((): House[] => {
    const ids = this.favoritesStore.favoriteIds();
    const entityMap = this.housesStore.entityMap();
    return ids.map((id) => entityMap[id]).filter((h): h is House => h !== undefined);
  });

  protected readonly pendingCount = computed(() => {
    const ids = this.favoritesStore.favoriteIds();
    const entityMap = this.housesStore.entityMap();
    return ids.filter((id) => !entityMap[id]).length;
  });

  constructor() {
    effect(() => {
      for (const id of this.favoritesStore.favoriteIds()) {
        this.housesStore.preloadHouse(id);
      }
    });
  }
}
