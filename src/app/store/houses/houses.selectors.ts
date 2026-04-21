import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HousesState } from './houses.reducer';

export const selectHousesFeature = createFeatureSelector<HousesState>('houses');

export const selectHousesList = createSelector(selectHousesFeature, s => s.list);
export const selectHousesLoading = createSelector(selectHousesFeature, s => s.loading);
export const selectHousesError = createSelector(selectHousesFeature, s => s.error);
export const selectPagination = createSelector(selectHousesFeature, s => s.pagination);
