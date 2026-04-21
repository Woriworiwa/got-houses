import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { House, houseIdFromUrl } from '../../core/models/house.model';
import { HousesStore } from '../houses/houses.store';
import { FavoritesStore } from './favorites.store';

@Component({
  selector: 'app-favorites-list',
  templateUrl: './favorites-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
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
