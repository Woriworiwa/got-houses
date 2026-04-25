import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HousesStore } from '../../../core/stores/houses.store';
import { FavoritesStore } from '../../../core/stores/favorites.store';
import { houseIdFromUrl } from '../../../core/models/house.model';
import { NavigationContextService } from '../../../core/services/navigation-context.service';

@Component({
  selector: 'app-house-detail',
  templateUrl: './detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class HouseDetailComponent {
  protected readonly store = inject(HousesStore);
  protected readonly favoritesStore = inject(FavoritesStore);

  private readonly navContext = inject(NavigationContextService);

  private readonly fromFavorites =
    inject(Router).lastSuccessfulNavigation()?.finalUrl?.toString() === '/favorites';

  protected readonly backLink = this.fromFavorites ? '/favorites' : '/houses';
  protected readonly backLabel = this.fromFavorites ? 'Back to Favorites' : 'Back to Houses';

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
    this.navContext.fromFavorites.set(this.fromFavorites);
    inject(DestroyRef).onDestroy(() => this.navContext.fromFavorites.set(false));
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
