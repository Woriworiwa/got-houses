import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

const STORAGE_KEY = 'got-houses-favorites';

function loadFavoriteIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as number[]) : [];
  } catch {
    return [];
  }
}

function saveFavoriteIds(ids: number[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export const FavoritesStore = signalStore(
  { providedIn: 'root' },
  withState({ favoriteIds: loadFavoriteIds() }),
  withComputed((store) => ({
    favoriteCount: computed(() => store.favoriteIds().length),
    favoriteIdSet: computed(() => new Set(store.favoriteIds())),
  })),
  withMethods((store) => ({
    toggleFavorite(id: number): void {
      const ids = store.favoriteIds();
      const newIds = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
      patchState(store, { favoriteIds: newIds });
      saveFavoriteIds(newIds);
    },
  })),
);
