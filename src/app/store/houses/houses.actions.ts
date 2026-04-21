import { createAction, props } from '@ngrx/store';
import { House } from '../../core/models/house.model';
import { PaginationMeta } from '../../core/models/pagination.model';

export type SearchMode = 'exact' | 'contains';

export const loadHouses = createAction(
  '[Houses] Load Houses',
  props<{ page: number; pageSize: number; name?: string }>(),
);
export const loadHousesSuccess = createAction(
  '[Houses] Load Houses Success',
  props<{ houses: House[]; pagination: PaginationMeta }>(),
);
export const loadHousesFailure = createAction(
  '[Houses] Load Houses Failure',
  props<{ error: string }>(),
);

export const loadAllHouses = createAction('[Houses] Load All Houses');
export const loadAllHousesSuccess = createAction(
  '[Houses] Load All Houses Success',
  props<{ houses: House[] }>(),
);
export const loadAllHousesFailure = createAction(
  '[Houses] Load All Houses Failure',
  props<{ error: string }>(),
);

export const setSearchMode = createAction(
  '[Houses] Set Search Mode',
  props<{ mode: SearchMode }>(),
);
export const setSearchName = createAction(
  '[Houses] Set Search Name',
  props<{ name: string }>(),
);
export const setContainsPage = createAction(
  '[Houses] Set Contains Page',
  props<{ page: number; pageSize: number }>(),
);
