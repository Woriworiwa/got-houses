import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { IceAndFireApiService } from '../../core/services/ice-and-fire-api.service';
import * as HousesActions from './houses.actions';
import { selectAllHousesLoaded, selectName } from './houses.selectors';

@Injectable()
export class HousesEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(IceAndFireApiService);
  private readonly store = inject(Store);

  loadHouses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HousesActions.loadHouses),
      switchMap(({ page, pageSize, name }) =>
        this.api.getHouses(page, pageSize, name).pipe(
          map(({ houses, pagination }) => HousesActions.loadHousesSuccess({ houses, pagination })),
          catchError((err) =>
            of(
              HousesActions.loadHousesFailure({
                error: (err as Error).message ?? 'Failed to load houses',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadAllHouses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HousesActions.loadAllHouses),
      switchMap(() =>
        this.api.getAllHouses().pipe(
          map((houses) => HousesActions.loadAllHousesSuccess({ houses })),
          catchError((err) =>
            of(
              HousesActions.loadAllHousesFailure({
                error: (err as Error).message ?? 'Failed to load all houses',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  setSearchMode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HousesActions.setSearchMode),
      withLatestFrom(this.store.select(selectAllHousesLoaded), this.store.select(selectName)),
      switchMap(([{ mode }, allLoaded, name]) => {
        if (mode === 'partial') {
          return allLoaded ? EMPTY : of(HousesActions.loadAllHouses());
        }
        return of(HousesActions.loadHouses({ page: 1, pageSize: 10, name }));
      }),
    ),
  );

  loadHouseDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HousesActions.loadHouseDetail),
      switchMap(({ id }) =>
        this.api.getHouse(id).pipe(
          map((house) => HousesActions.loadHouseDetailSuccess({ house })),
          catchError((err) =>
            of(
              HousesActions.loadHouseDetailFailure({
                error: (err as Error).message ?? 'Failed to load house',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
