import { createAction, props } from '@ngrx/store';
import { House } from '../../core/models/house.model';
import { PaginationMeta } from '../../core/models/pagination.model';

export const loadHouses = createAction(
  '[Houses] Load Houses',
  props<{ page: number; pageSize: number }>(),
);

export const loadHousesSuccess = createAction(
  '[Houses] Load Houses Success',
  props<{ houses: House[]; pagination: PaginationMeta }>(),
);

export const loadHousesFailure = createAction(
  '[Houses] Load Houses Failure',
  props<{ error: string }>(),
);

