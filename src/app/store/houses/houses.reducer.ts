import { createReducer, on } from '@ngrx/store';
import { House } from '../../core/models/house.model';
import { PaginationMeta } from '../../core/models/pagination.model';
import * as HousesActions from './houses.actions';
import { SearchMode } from './houses.actions';

export interface HousesState {
  list: House[];
  allHouses: House[];
  allHousesLoaded: boolean;
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  name: string;
  searchMode: SearchMode;
}

const initialState: HousesState = {
  list: [],
  allHouses: [],
  allHousesLoaded: false,
  loading: false,
  error: null,
  pagination: { currentPage: 1, pageSize: 10, totalCount: 0 },
  name: '',
  searchMode: 'exact',
};

export const housesReducer = createReducer(
  initialState,
  on(HousesActions.loadHouses, (state, { name = '' }) => ({
    ...state,
    loading: true,
    error: null,
    name,
  })),
  on(HousesActions.loadHousesSuccess, (state, { houses, pagination }) => ({
    ...state,
    loading: false,
    list: houses,
    pagination,
  })),
  on(HousesActions.loadHousesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(HousesActions.loadAllHouses, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(HousesActions.loadAllHousesSuccess, (state, { houses }) => ({
    ...state,
    loading: false,
    allHouses: houses,
    allHousesLoaded: true,
  })),
  on(HousesActions.loadAllHousesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(HousesActions.setSearchMode, (state, { mode }) => ({
    ...state,
    searchMode: mode,
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  on(HousesActions.setSearchName, (state, { name }) => ({
    ...state,
    name,
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  on(HousesActions.setContainsPage, (state, { page, pageSize }) => ({
    ...state,
    pagination: { ...state.pagination, currentPage: page, pageSize },
  })),
);
