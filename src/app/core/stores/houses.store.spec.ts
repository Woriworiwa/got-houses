import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { HousesStore } from './houses.store';
import { IceAndFireApiService } from '../../core/services/ice-and-fire-api.service';
import { House, houseIdFromUrl } from '../../core/models/house.model';
import { PaginationMeta } from '../../core/models/pagination.model';

// ── fixtures ──────────────────────────────────────────────────────────────────

const makeHouse = (name: string, id = 1): House => ({
  url: `https://anapioficeandfire.com/api/houses/${id}`,
  name,
  region: '',
  coatOfArms: '',
  words: '',
  titles: [],
  seats: [],
  currentLord: '',
  heir: '',
  overlord: '',
  founded: '',
  founder: '',
  diedOut: '',
  ancestralWeapons: [],
  cadetBranches: [],
  swornMembers: [],
});

const pagination: PaginationMeta = { currentPage: 1, pageSize: 10, totalCount: 100 };

const mockApi = {
  getHouses: vi.fn(),
  getAllHouses: vi.fn(),
  getHouse: vi.fn(),
};

// ── helpers ───────────────────────────────────────────────────────────────────

function setup() {
  TestBed.configureTestingModule({
    providers: [{ provide: IceAndFireApiService, useValue: mockApi }],
  });
  return TestBed.inject(HousesStore);
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('HousesStore', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── initial state ──────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('has empty entity map and ids', () => {
      const store = setup();
      expect(store.entityMap()).toEqual({});
      expect(store.ids()).toEqual([]);
    });

    it('starts with searchMode exact and page 1', () => {
      const store = setup();
      expect(store.searchMode()).toBe('exact');
      expect(store.pagination().currentPage).toBe(1);
    });

    it('entities computed returns empty array', () => {
      const store = setup();
      expect(store.entities()).toEqual([]);
    });

    it('displayedHouses computed returns empty array', () => {
      const store = setup();
      expect(store.displayedHouses()).toEqual([]);
    });

    it('selectedHouse returns null when no ID set', () => {
      const store = setup();
      expect(store.selectedHouse()).toBeNull();
    });
  });

  // ── loadHouses ────────────────────────────────────────────────────────────

  describe('loadHouses', () => {
    it('upserts houses and updates pagination on success', () => {
      const houses = [makeHouse('House Stark', 1), makeHouse('House Lannister', 2)];
      mockApi.getHouses.mockReturnValue(of({ houses, pagination }));

      const store = setup();
      store.loadHouses({ page: 1, pageSize: 10 });

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.entityMap()[1]).toEqual(houses[0]);
      expect(store.entityMap()[2]).toEqual(houses[1]);
      expect(store.currentPageIds()).toEqual([1, 2]);
      expect(store.pagination()).toEqual(pagination);
    });

    it('sets name when provided', () => {
      mockApi.getHouses.mockReturnValue(of({ houses: [], pagination }));
      const store = setup();
      store.loadHouses({ page: 1, pageSize: 10, name: 'Stark' });
      expect(store.name()).toBe('Stark');
    });

    it('does not reset name when name is absent', () => {
      mockApi.getHouses.mockReturnValue(of({ houses: [], pagination }));
      const store = setup();
      // First call sets name
      store.loadHouses({ page: 1, pageSize: 10, name: 'Stark' });
      // Second call without name should not clear it
      store.loadHouses({ page: 2, pageSize: 10 });
      expect(store.name()).toBe('Stark');
    });

    it('sets error and clears loading on API failure', () => {
      mockApi.getHouses.mockReturnValue(throwError(() => new Error('Network error')));
      const store = setup();
      store.loadHouses({ page: 1, pageSize: 10 });
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Network error');
    });

    it('extracts status text from HttpErrorResponse', () => {
      mockApi.getHouses.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' })),
      );
      const store = setup();
      store.loadHouses({ page: 1, pageSize: 10 });
      expect(store.error()).toBe('503 Service Unavailable');
    });

    it('merges new houses into existing entity cache without overwriting others', () => {
      const house1 = makeHouse('House Stark', 1);
      const house2 = makeHouse('House Lannister', 2);
      const pag1: PaginationMeta = { currentPage: 1, pageSize: 1, totalCount: 2 };
      const pag2: PaginationMeta = { currentPage: 2, pageSize: 1, totalCount: 2 };

      mockApi.getHouses
        .mockReturnValueOnce(of({ houses: [house1], pagination: pag1 }))
        .mockReturnValueOnce(of({ houses: [house2], pagination: pag2 }));

      const store = setup();
      store.loadHouses({ page: 1, pageSize: 1 });
      store.loadHouses({ page: 2, pageSize: 1 });

      expect(store.entityMap()[1]).toEqual(house1);
      expect(store.entityMap()[2]).toEqual(house2);
      expect(store.currentPageIds()).toEqual([2]);
    });
  });

  // ── loadAllHouses ─────────────────────────────────────────────────────────

  describe('loadAllHouses', () => {
    it('loads all houses and sets allHousesLoaded', () => {
      const houses = [makeHouse('House Stark', 1), makeHouse('House Lannister', 2)];
      mockApi.getAllHouses.mockReturnValue(of(houses));

      const store = setup();
      store.loadAllHouses();

      expect(store.allHousesLoaded()).toBe(true);
      expect(store.loading()).toBe(false);
      expect(store.ids().length).toBe(2);
    });

    it('sets error on failure', () => {
      mockApi.getAllHouses.mockReturnValue(throwError(() => new Error('Timeout')));
      const store = setup();
      store.loadAllHouses();
      expect(store.error()).toBe('Timeout');
      expect(store.allHousesLoaded()).toBe(false);
    });
  });

  // ── loadHouseDetail ───────────────────────────────────────────────────────

  describe('loadHouseDetail', () => {
    it('fetches from API and sets selectedHouseId when not cached', () => {
      const house = makeHouse('House Stark', 42);
      mockApi.getHouse.mockReturnValue(of(house));

      const store = setup();
      store.loadHouseDetail(42);

      expect(mockApi.getHouse).toHaveBeenCalledWith(42);
      expect(store.selectedHouseId()).toBe(42);
      expect(store.selectedHouse()).toEqual(house);
      expect(store.selectedHouseLoading()).toBe(false);
      expect(store.selectedHouseError()).toBeNull();
    });

    it('uses cache and skips HTTP call when house already in entityMap', () => {
      const houses = [makeHouse('House Stark', 42)];
      mockApi.getHouses.mockReturnValue(of({ houses, pagination }));

      const store = setup();
      store.loadHouses({ page: 1, pageSize: 10 });

      vi.clearAllMocks();
      store.loadHouseDetail(42);

      expect(mockApi.getHouse).not.toHaveBeenCalled();
      expect(store.selectedHouseId()).toBe(42);
    });

    it('sets selectedHouseError on API failure', () => {
      mockApi.getHouse.mockReturnValue(throwError(() => new Error('Not found')));
      const store = setup();
      store.loadHouseDetail(99);
      expect(store.selectedHouseError()).toBe('Not found');
      expect(store.selectedHouseLoading()).toBe(false);
    });
  });

  // ── computed: entities ────────────────────────────────────────────────────

  describe('entities computed', () => {
    it('returns houses in insertion order', () => {
      const stark = makeHouse('House Stark', 1);
      const lannister = makeHouse('House Lannister', 2);
      mockApi.getHouses.mockReturnValue(of({ houses: [stark, lannister], pagination }));

      const store = setup();
      store.loadHouses({ page: 1, pageSize: 10 });

      expect(store.entities()[0]).toEqual(stark);
      expect(store.entities()[1]).toEqual(lannister);
    });
  });

  // ── computed: containsFiltered ────────────────────────────────────────────

  describe('containsFiltered computed', () => {
    it('returns empty array before allHousesLoaded', () => {
      mockApi.getHouses.mockReturnValue(of({ houses: [makeHouse('House Stark', 1)], pagination }));
      const store = setup();
      store.loadHouses({ page: 1, pageSize: 10 });
      expect(store.containsFiltered()).toEqual([]);
    });

    it('returns all houses sorted A-Z when no filter term after full load', () => {
      const houses = [makeHouse('House Stark', 1), makeHouse('House Arryn', 2)];
      mockApi.getAllHouses.mockReturnValue(of(houses));

      const store = setup();
      store.loadAllHouses();

      const filtered = store.containsFiltered();
      expect(filtered[0].name).toBe('House Arryn');
      expect(filtered[1].name).toBe('House Stark');
    });

    it('filters by substring case-insensitively', () => {
      const houses = [makeHouse('House Stark', 1), makeHouse('House Lannister', 2), makeHouse('House Arryn', 3)];
      mockApi.getAllHouses.mockReturnValue(of(houses));

      const store = setup();
      store.loadAllHouses();
      store.setSearchName('stark');

      expect(store.containsFiltered()).toHaveLength(1);
      expect(store.containsFiltered()[0].name).toBe('House Stark');
    });
  });

  // ── computed: displayedHouses ─────────────────────────────────────────────

  describe('displayedHouses computed', () => {
    it('returns currentPageHouses in exact mode', () => {
      const houses = [makeHouse('House Stark', 1)];
      mockApi.getHouses.mockReturnValue(of({ houses, pagination }));

      const store = setup();
      store.loadHouses({ page: 1, pageSize: 10 });

      expect(store.displayedHouses()).toEqual(houses);
    });

    it('returns paginated containsFiltered slice in partial mode', () => {
      const houses = Array.from({ length: 15 }, (_, i) => makeHouse(`House ${String.fromCharCode(65 + i)}`, i + 1));
      mockApi.getAllHouses.mockReturnValue(of(houses));

      const store = setup();
      store.setSearchMode('partial');

      expect(store.displayedHouses()).toHaveLength(10);
      store.setContainsPage(2, 10);
      expect(store.displayedHouses()).toHaveLength(5);
    });
  });

  // ── computed: displayTotalCount ───────────────────────────────────────────

  describe('displayTotalCount computed', () => {
    it('returns pagination.totalCount in exact mode', () => {
      mockApi.getHouses.mockReturnValue(of({ houses: [], pagination: { currentPage: 1, pageSize: 10, totalCount: 444 } }));
      const store = setup();
      store.loadHouses({ page: 1, pageSize: 10 });
      expect(store.displayTotalCount()).toBe(444);
    });

    it('returns filtered count in partial mode', () => {
      const houses = [makeHouse('House Stark', 1), makeHouse('House Lannister', 2)];
      mockApi.getAllHouses.mockReturnValue(of(houses));

      const store = setup();
      store.loadAllHouses();
      store.setSearchMode('partial');
      store.setSearchName('stark');

      expect(store.displayTotalCount()).toBe(1);
    });
  });

  // ── setSearchMode ─────────────────────────────────────────────────────────

  describe('setSearchMode', () => {
    it('switching to partial triggers loadAllHouses when not yet loaded', () => {
      mockApi.getAllHouses.mockReturnValue(of([]));
      const store = setup();
      store.setSearchMode('partial');
      expect(mockApi.getAllHouses).toHaveBeenCalledTimes(1);
    });

    it('switching to partial does not call getAllHouses when already loaded', () => {
      mockApi.getAllHouses.mockReturnValue(of([]));
      const store = setup();
      store.setSearchMode('partial'); // loads
      vi.clearAllMocks();
      store.setSearchMode('exact');
      mockApi.getHouses.mockReturnValue(of({ houses: [], pagination }));
      store.setSearchMode('partial'); // already loaded — no extra call
      expect(mockApi.getAllHouses).not.toHaveBeenCalled();
    });

    it('switching to exact dispatches loadHouses with page 1 and current name', () => {
      mockApi.getHouses.mockReturnValue(of({ houses: [], pagination }));
      mockApi.getAllHouses.mockReturnValue(of([]));

      const store = setup();
      store.loadHouses({ page: 1, pageSize: 10, name: 'lannister' });
      store.setSearchMode('partial');
      vi.clearAllMocks();

      mockApi.getHouses.mockReturnValue(of({ houses: [], pagination }));
      store.setSearchMode('exact');

      expect(mockApi.getHouses).toHaveBeenCalledWith(1, 10, 'lannister');
    });

    it('resets currentPage to 1 on mode change', () => {
      mockApi.getAllHouses.mockReturnValue(of([]));
      const store = setup();
      store.setContainsPage(3, 10);
      store.setSearchMode('partial');
      expect(store.pagination().currentPage).toBe(1);
    });
  });

  // ── setSearchName ─────────────────────────────────────────────────────────

  describe('setSearchName', () => {
    it('updates name and resets page to 1', () => {
      const store = setup();
      store.setContainsPage(3, 10);
      store.setSearchName('dragon');
      expect(store.name()).toBe('dragon');
      expect(store.pagination().currentPage).toBe(1);
    });
  });

  // ── setContainsPage ───────────────────────────────────────────────────────

  describe('setContainsPage', () => {
    it('updates currentPage and pageSize', () => {
      const store = setup();
      store.setContainsPage(4, 25);
      expect(store.pagination().currentPage).toBe(4);
      expect(store.pagination().pageSize).toBe(25);
    });
  });
});
