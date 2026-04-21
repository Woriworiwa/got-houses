import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { IceAndFireApiService } from '../../core/services/ice-and-fire-api.service';
import * as HousesActions from './houses.actions';

@Injectable()
export class HousesEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(IceAndFireApiService);

  loadHouses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HousesActions.loadHouses),
      switchMap(({ page, pageSize }) =>
        this.api.getHouses(page, pageSize).pipe(
          map(({ houses, pagination }) =>
            HousesActions.loadHousesSuccess({ houses, pagination }),
          ),
          catchError(err =>
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
}
