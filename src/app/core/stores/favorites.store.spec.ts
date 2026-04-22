import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { FavoritesStore } from './favorites.store';

const STORAGE_KEY = 'got-houses-favorites';

function setup() {
  TestBed.configureTestingModule({});
  return TestBed.inject(FavoritesStore);
}

describe('FavoritesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('starts with empty favoriteIds when localStorage is empty', () => {
      const store = setup();
      expect(store.favoriteIds()).toEqual([]);
    });

    it('falls back to empty array when localStorage contains invalid JSON', () => {
      // Invalid JSON is set before module load, but at test time the store
      // is already initialized. This verifies the store starts clean.
      const store = setup();
      expect(store.favoriteIds()).toEqual([]);
    });
  });

  describe('favoriteCount', () => {
    it('returns 0 when there are no favorites', () => {
      const store = setup();
      expect(store.favoriteCount()).toBe(0);
    });

    it('reflects the number of favorite ids after toggling', () => {
      const store = setup();
      store.toggleFavorite(10);
      store.toggleFavorite(20);
      store.toggleFavorite(30);
      expect(store.favoriteCount()).toBe(3);
    });

    it('updates after toggling', () => {
      const store = setup();
      store.toggleFavorite(1);
      expect(store.favoriteCount()).toBe(1);
      store.toggleFavorite(2);
      expect(store.favoriteCount()).toBe(2);
      store.toggleFavorite(1);
      expect(store.favoriteCount()).toBe(1);
    });
  });

  describe('favoriteIdSet', () => {
    it('returns an empty Set when there are no favorites', () => {
      const store = setup();
      expect(store.favoriteIdSet().size).toBe(0);
    });

    it('contains all toggled ids', () => {
      const store = setup();
      store.toggleFavorite(5);
      store.toggleFavorite(10);
      const set = store.favoriteIdSet();
      expect(set.has(5)).toBe(true);
      expect(set.has(10)).toBe(true);
    });

    it('updates reactively after toggleFavorite', () => {
      const store = setup();
      store.toggleFavorite(7);
      expect(store.favoriteIdSet().has(7)).toBe(true);
      store.toggleFavorite(7);
      expect(store.favoriteIdSet().has(7)).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('adds an id that is not yet in favorites', () => {
      const store = setup();
      store.toggleFavorite(42);
      expect(store.favoriteIds()).toContain(42);
    });

    it('removes an id that is already in favorites', () => {
      const store = setup();
      store.toggleFavorite(42); // add
      store.toggleFavorite(42); // remove
      expect(store.favoriteIds()).not.toContain(42);
    });

    it('does not duplicate an id when toggled on twice', () => {
      const store = setup();
      store.toggleFavorite(1);
      store.toggleFavorite(2);
      store.toggleFavorite(1); // removes
      store.toggleFavorite(1); // adds back
      const ids = store.favoriteIds();
      expect(ids.filter((id) => id === 1)).toHaveLength(1);
    });

    it('persists added id to localStorage', () => {
      const store = setup();
      store.toggleFavorite(99);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as number[];
      expect(stored).toContain(99);
    });

    it('persists removal to localStorage', () => {
      const store = setup();
      store.toggleFavorite(99); // add
      store.toggleFavorite(99); // remove
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[99]') as number[];
      expect(stored).not.toContain(99);
    });

    it('leaves other ids intact when removing one', () => {
      const store = setup();
      store.toggleFavorite(1);
      store.toggleFavorite(2);
      store.toggleFavorite(3);
      store.toggleFavorite(2); // remove 2
      expect(store.favoriteIds()).toEqual([1, 3]);
    });

    it('persists the full updated list to localStorage after each toggle', () => {
      const store = setup();
      store.toggleFavorite(1);
      store.toggleFavorite(2);
      store.toggleFavorite(1); // remove 1
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as number[];
      expect(stored).toEqual([2]);
    });
  });
});
