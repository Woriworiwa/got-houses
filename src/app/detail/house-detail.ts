import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HousesStore } from '../houses.store';
import { FavoritesStore } from '../../favorites/favorites.store';
import { houseIdFromUrl } from '../../../core/models/house.model';

@Component({
  selector: 'app-house-detail',
  templateUrl: './house-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
})
export class HouseDetailComponent {
  protected readonly store = inject(HousesStore);
  protected readonly favoritesStore = inject(FavoritesStore);

  readonly id = input.required<string>();

  protected readonly house = this.store.selectedHouse;
  protected readonly loading = this.store.selectedHouseLoading;
  protected readonly error = this.store.selectedHouseError;

  protected readonly isFavorite = computed(() => {
    const h = this.house();
    if (!h) return false;
    return this.favoritesStore.favoriteIdSet().has(houseIdFromUrl(h.url));
  });

  constructor() {
    effect(() => {
      this.store.loadHouseDetail(Number(this.id()));
    });
  }

  protected toggleFavorite(): void {
    const h = this.house();
    if (h) {
      this.favoritesStore.toggleFavorite(houseIdFromUrl(h.url));
    }
  }
}
