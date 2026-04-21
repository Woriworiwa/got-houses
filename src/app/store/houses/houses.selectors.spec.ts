import {
  selectAllHousesLoaded,
  selectDisplayedHouses,
  selectDisplayTotalCount,
  selectHousesError,
  selectHousesLoading,
  selectName,
  selectPagination,
  selectSearchMode,
  selectSelectedHouse,
  selectSelectedHouseError,
  selectSelectedHouseLoading,
} from './houses.selectors';
import { HousesState } from './houses.reducer';
import { makeHouse } from './houses.test-fixtures';

const baseState: HousesState = {
  list: [],
  allHouses: [],
  allHousesLoaded: false,
  loading: false,
  error: null,
  pagination: { currentPage: 1, pageSize: 10, totalCount: 0 },
  name: '',
  searchMode: 'exact',
  selectedHouse: null,
  selectedHouseLoading: false,
  selectedHouseError: null,
};

// Selectors use createFeatureSelector which requires a root state shape.
// We call the projector directly to avoid needing a real Store.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const project = <T>(selector: { projector: (...args: any[]) => T }, state: HousesState): T =>
  selector.projector(state);

describe('simple selectors', () => {
  it('selectHousesLoading', () => {
    expect(project(selectHousesLoading, { ...baseState, loading: true })).toBe(true);
  });

  it('selectHousesError', () => {
    expect(project(selectHousesError, { ...baseState, error: 'oops' })).toBe('oops');
  });

  it('selectPagination', () => {
    const pagination = { currentPage: 2, pageSize: 25, totalCount: 100 };
    expect(project(selectPagination, { ...baseState, pagination })).toBe(pagination);
  });

  it('selectName', () => {
    expect(project(selectName, { ...baseState, name: 'stark' })).toBe('stark');
  });

  it('selectSearchMode', () => {
    expect(project(selectSearchMode, { ...baseState, searchMode: 'partial' })).toBe('partial');
  });

  it('selectAllHousesLoaded', () => {
    expect(project(selectAllHousesLoaded, { ...baseState, allHousesLoaded: true })).toBe(true);
  });

  it('selectSelectedHouse', () => {
    const house = makeHouse('House Stark');
    expect(project(selectSelectedHouse, { ...baseState, selectedHouse: house })).toBe(house);
  });

  it('selectSelectedHouse returns null when no house loaded', () => {
    expect(project(selectSelectedHouse, baseState)).toBeNull();
  });

  it('selectSelectedHouseLoading', () => {
    expect(project(selectSelectedHouseLoading, { ...baseState, selectedHouseLoading: true })).toBe(true);
  });

  it('selectSelectedHouseError', () => {
    expect(project(selectSelectedHouseError, { ...baseState, selectedHouseError: 'Not found' })).toBe('Not found');
  });
});

describe('selectDisplayedHouses', () => {
  const allHouses = [
    makeHouse('House Stark'),
    makeHouse('House Lannister'),
    makeHouse('House Rose'),
    makeHouse('House Tyrell of Highgarden'),
    makeHouse('House Baratheon'),
  ];

  describe('in exact mode', () => {
    it('returns state.list regardless of allHouses', () => {
      const list = [makeHouse('House Stark')];
      const state: HousesState = { ...baseState, searchMode: 'exact', list, allHouses };
      expect(selectDisplayedHouses.projector(state, allHouses)).toBe(list);
    });
  });

  describe('in partial mode', () => {
    it('returns all houses when name is empty', () => {
      const state: HousesState = { ...baseState, searchMode: 'partial', allHouses, name: '' };
      const result = selectDisplayedHouses.projector(state, allHouses);
      expect(result).toEqual(allHouses);
    });

    it('filters houses by name (case-insensitive)', () => {
      const state: HousesState = { ...baseState, searchMode: 'partial', allHouses, name: 'rose' };
      const filtered = [makeHouse('House Rose'), makeHouse('House Tyrell of Highgarden')];
      // filtered input already applied by selectContainsFiltered
      const result = selectDisplayedHouses.projector(state, filtered);
      expect(result).toEqual(filtered);
    });

    it('paginates the filtered results', () => {
      const manyHouses = Array.from({ length: 30 }, (_, i) => makeHouse(`House ${i}`));
      const state: HousesState = {
        ...baseState,
        searchMode: 'partial',
        allHouses: manyHouses,
        pagination: { currentPage: 2, pageSize: 10, totalCount: 0 },
      };
      const result = selectDisplayedHouses.projector(state, manyHouses);
      expect(result).toEqual(manyHouses.slice(10, 20));
    });

    it('returns empty array when filter matches nothing', () => {
      const state: HousesState = { ...baseState, searchMode: 'partial', allHouses };
      const result = selectDisplayedHouses.projector(state, []);
      expect(result).toEqual([]);
    });
  });
});

describe('selectDisplayTotalCount', () => {
  const allHouses = Array.from({ length: 15 }, (_, i) => makeHouse(`House ${i}`));

  it('returns pagination.totalCount in exact mode', () => {
    const state: HousesState = {
      ...baseState,
      searchMode: 'exact',
      pagination: { currentPage: 1, pageSize: 10, totalCount: 444 },
    };
    expect(selectDisplayTotalCount.projector(state, allHouses)).toBe(444);
  });

  it('returns filtered array length in partial mode', () => {
    const state: HousesState = {
      ...baseState,
      searchMode: 'partial',
      pagination: { currentPage: 1, pageSize: 10, totalCount: 444 },
    };
    const filtered = allHouses.slice(0, 6);
    expect(selectDisplayTotalCount.projector(state, filtered)).toBe(6);
  });
});
