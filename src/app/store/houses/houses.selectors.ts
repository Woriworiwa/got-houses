import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HousesState } from './houses.reducer';

export const selectHousesFeature = createFeatureSelector<HousesState>('houses');

export const selectHousesList = createSelector(selectHousesFeature, (s) => s.list);
export const selectHousesLoading = createSelector(selectHousesFeature, (s) => s.loading);
export const selectHousesError = createSelector(selectHousesFeature, (s) => s.error);
export const selectPagination = createSelector(selectHousesFeature, (s) => s.pagination);
export const selectName = createSelector(selectHousesFeature, (s) => s.name);
export const selectSearchMode = createSelector(selectHousesFeature, (s) => s.searchMode);
export const selectAllHousesLoaded = createSelector(selectHousesFeature, (s) => s.allHousesLoaded);

const selectContainsFiltered = createSelector(selectHousesFeature, (s) => {
  const term = s.name.toLowerCase().trim();
  if (!term) return s.allHouses;
  return s.allHouses.filter((h) => h.name.toLowerCase().includes(term));
});

export const selectDisplayedHouses = createSelector(
  selectHousesFeature,
  selectContainsFiltered,
  (state, filtered) => {
    if (state.searchMode === 'partial') {
      const start = (state.pagination.currentPage - 1) * state.pagination.pageSize;
      return filtered.slice(start, start + state.pagination.pageSize);
    }
    return state.list;
  },
);

export const selectDisplayTotalCount = createSelector(
  selectHousesFeature,
  selectContainsFiltered,
  (state, filtered) =>
    state.searchMode === 'partial' ? filtered.length : state.pagination.totalCount,
);
