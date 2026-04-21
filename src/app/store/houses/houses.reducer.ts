import { createReducer, on } from '@ngrx/store';
import { House } from '../../core/models/house.model';
import { PaginationMeta } from '../../core/models/pagination.model';
import * as HousesActions from './houses.actions';

export interface HousesState {
  list: House[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta;
}

const initialState: HousesState = {
  list: [],
  loading: false,
  error: null,
  pagination: { currentPage: 1, pageSize: 10, totalCount: 0 },
};

export const housesReducer = createReducer(
  initialState,
  on(HousesActions.loadHouses, state => ({
    ...state,
    loading: true,
    error: null,
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
);
