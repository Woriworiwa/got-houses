import { housesReducer, HousesState } from './houses.reducer';
import * as HousesActions from './houses.actions';
import { PaginationMeta } from '../../core/models/pagination.model';
import { makeHouse } from './houses.test-fixtures';

const initialState: HousesState = {
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

const pagination: PaginationMeta = { currentPage: 2, pageSize: 25, totalCount: 100 };

describe('housesReducer', () => {
  describe('loadHouses', () => {
    it('sets loading to true and clears error', () => {
      const state = { ...initialState, error: 'previous error' };
      const next = housesReducer(state, HousesActions.loadHouses({ page: 1, pageSize: 10 }));
      expect(next.loading).toBe(true);
      expect(next.error).toBeNull();
    });

    it('stores the search name', () => {
      const next = housesReducer(initialState, HousesActions.loadHouses({ page: 1, pageSize: 10, name: 'Stark' }));
      expect(next.name).toBe('Stark');
    });

    it('defaults name to empty string when not provided', () => {
      const state = { ...initialState, name: 'Stark' };
      const next = housesReducer(state, HousesActions.loadHouses({ page: 1, pageSize: 10 }));
      expect(next.name).toBe('');
    });
  });

  describe('loadHousesSuccess', () => {
    it('stores houses and pagination, clears loading', () => {
      const state = { ...initialState, loading: true };
      const houses = [makeHouse('House Stark')];
      const next = housesReducer(state, HousesActions.loadHousesSuccess({ houses, pagination }));
      expect(next.loading).toBe(false);
      expect(next.list).toBe(houses);
      expect(next.pagination).toBe(pagination);
    });
  });

  describe('loadHousesFailure', () => {
    it('stores error and clears loading', () => {
      const state = { ...initialState, loading: true };
      const next = housesReducer(state, HousesActions.loadHousesFailure({ error: 'Network error' }));
      expect(next.loading).toBe(false);
      expect(next.error).toBe('Network error');
    });
  });

  describe('loadAllHouses', () => {
    it('sets loading to true and clears error', () => {
      const state = { ...initialState, error: 'previous error' };
      const next = housesReducer(state, HousesActions.loadAllHouses());
      expect(next.loading).toBe(true);
      expect(next.error).toBeNull();
    });
  });

  describe('loadAllHousesSuccess', () => {
    it('stores all houses, sets allHousesLoaded, clears loading', () => {
      const state = { ...initialState, loading: true };
      const houses = [makeHouse('House Stark'), makeHouse('House Lannister')];
      const next = housesReducer(state, HousesActions.loadAllHousesSuccess({ houses }));
      expect(next.loading).toBe(false);
      expect(next.allHouses).toBe(houses);
      expect(next.allHousesLoaded).toBe(true);
    });
  });

  describe('loadAllHousesFailure', () => {
    it('stores error and clears loading', () => {
      const state = { ...initialState, loading: true };
      const next = housesReducer(state, HousesActions.loadAllHousesFailure({ error: 'Failed' }));
      expect(next.loading).toBe(false);
      expect(next.error).toBe('Failed');
    });
  });

  describe('setSearchMode', () => {
    it('updates searchMode', () => {
      const next = housesReducer(initialState, HousesActions.setSearchMode({ mode: 'partial' }));
      expect(next.searchMode).toBe('partial');
    });

    it('resets currentPage to 1', () => {
      const state = { ...initialState, pagination: { ...initialState.pagination, currentPage: 3 } };
      const next = housesReducer(state, HousesActions.setSearchMode({ mode: 'partial' }));
      expect(next.pagination.currentPage).toBe(1);
    });

    it('does not clear the search name', () => {
      const state = { ...initialState, name: 'rose' };
      const next = housesReducer(state, HousesActions.setSearchMode({ mode: 'partial' }));
      expect(next.name).toBe('rose');
    });
  });

  describe('setSearchName', () => {
    it('updates the name', () => {
      const next = housesReducer(initialState, HousesActions.setSearchName({ name: 'lannister' }));
      expect(next.name).toBe('lannister');
    });

    it('resets currentPage to 1', () => {
      const state = { ...initialState, pagination: { ...initialState.pagination, currentPage: 5 } };
      const next = housesReducer(state, HousesActions.setSearchName({ name: 'stark' }));
      expect(next.pagination.currentPage).toBe(1);
    });
  });

  describe('loadHouseDetail', () => {
    it('sets selectedHouseLoading to true and clears selectedHouseError', () => {
      const state = { ...initialState, selectedHouseError: 'previous error' };
      const next = housesReducer(state, HousesActions.loadHouseDetail({ id: 42 }));
      expect(next.selectedHouseLoading).toBe(true);
      expect(next.selectedHouseError).toBeNull();
    });
  });

  describe('loadHouseDetailSuccess', () => {
    it('stores the house and clears selectedHouseLoading', () => {
      const state = { ...initialState, selectedHouseLoading: true };
      const house = makeHouse('House Stark');
      const next = housesReducer(state, HousesActions.loadHouseDetailSuccess({ house }));
      expect(next.selectedHouseLoading).toBe(false);
      expect(next.selectedHouse).toBe(house);
    });
  });

  describe('loadHouseDetailFailure', () => {
    it('stores selectedHouseError and clears selectedHouseLoading', () => {
      const state = { ...initialState, selectedHouseLoading: true };
      const next = housesReducer(state, HousesActions.loadHouseDetailFailure({ error: 'Not found' }));
      expect(next.selectedHouseLoading).toBe(false);
      expect(next.selectedHouseError).toBe('Not found');
    });
  });

  describe('setContainsPage', () => {
    it('updates currentPage and pageSize', () => {
      const next = housesReducer(initialState, HousesActions.setContainsPage({ page: 3, pageSize: 25 }));
      expect(next.pagination.currentPage).toBe(3);
      expect(next.pagination.pageSize).toBe(25);
    });

    it('preserves totalCount', () => {
      const state = { ...initialState, pagination: { currentPage: 1, pageSize: 10, totalCount: 444 } };
      const next = housesReducer(state, HousesActions.setContainsPage({ page: 2, pageSize: 10 }));
      expect(next.pagination.totalCount).toBe(444);
    });
  });
});
