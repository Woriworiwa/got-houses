import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { HousesEffects } from './houses.effects';
import { IceAndFireApiService } from '../../core/services/ice-and-fire-api.service';
import * as HousesActions from './houses.actions';
import { selectAllHousesLoaded, selectName } from './houses.selectors';
import { PaginationMeta } from '../../core/models/pagination.model';
import { makeHouse } from './houses.test-fixtures';

const pagination: PaginationMeta = { currentPage: 1, pageSize: 10, totalCount: 100 };

const mockApi = {
  getHouses: vi.fn(),
  getAllHouses: vi.fn(),
};

describe('HousesEffects', () => {
  let actions$: Observable<Action>;
  let effects: HousesEffects;
  let store: MockStore;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        HousesEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            { selector: selectAllHousesLoaded, value: false },
            { selector: selectName, value: '' },
          ],
        }),
        { provide: IceAndFireApiService, useValue: mockApi },
      ],
    });

    effects = TestBed.inject(HousesEffects);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => store.resetSelectors());

  // ─── loadHouses$ ──────────────────────────────────────────────────────────

  describe('loadHouses$', () => {
    it('dispatches loadHousesSuccess on API success', async () => {
      const houses = [makeHouse('House Stark')];
      mockApi.getHouses.mockReturnValue(of({ houses, pagination }));

      actions$ = of(HousesActions.loadHouses({ page: 1, pageSize: 10, name: 'Stark' }));

      const action = await firstValueFrom(effects.loadHouses$);

      expect(action).toEqual(HousesActions.loadHousesSuccess({ houses, pagination }));
      expect(mockApi.getHouses).toHaveBeenCalledWith(1, 10, 'Stark');
    });

    it('dispatches loadHousesFailure on API error', async () => {
      mockApi.getHouses.mockReturnValue(throwError(() => new Error('Network error')));

      actions$ = of(HousesActions.loadHouses({ page: 1, pageSize: 10 }));

      const action = await firstValueFrom(effects.loadHouses$);

      expect(action).toEqual(HousesActions.loadHousesFailure({ error: 'Network error' }));
    });
  });

  // ─── loadAllHouses$ ───────────────────────────────────────────────────────

  describe('loadAllHouses$', () => {
    it('dispatches loadAllHousesSuccess on API success', async () => {
      const houses = [makeHouse('House Stark'), makeHouse('House Lannister')];
      mockApi.getAllHouses.mockReturnValue(of(houses));

      actions$ = of(HousesActions.loadAllHouses());

      const action = await firstValueFrom(effects.loadAllHouses$);

      expect(action).toEqual(HousesActions.loadAllHousesSuccess({ houses }));
    });

    it('dispatches loadAllHousesFailure on API error', async () => {
      mockApi.getAllHouses.mockReturnValue(throwError(() => new Error('Timeout')));

      actions$ = of(HousesActions.loadAllHouses());

      const action = await firstValueFrom(effects.loadAllHouses$);

      expect(action).toEqual(HousesActions.loadAllHousesFailure({ error: 'Timeout' }));
    });
  });

  // ─── setSearchMode$ ───────────────────────────────────────────────────────

  describe('setSearchMode$', () => {
    describe('switching to partial', () => {
      it('dispatches loadAllHouses when allHouses not yet loaded', async () => {
        store.overrideSelector(selectAllHousesLoaded, false);
        store.refreshState();

        actions$ = of(HousesActions.setSearchMode({ mode: 'partial' }));

        const action = await firstValueFrom(effects.setSearchMode$);

        expect(action).toEqual(HousesActions.loadAllHouses());
      });

      it('emits nothing when allHouses already loaded', async () => {
        store.overrideSelector(selectAllHousesLoaded, true);
        store.refreshState();

        actions$ = of(HousesActions.setSearchMode({ mode: 'partial' }));

        const emitted: Action[] = [];
        await new Promise<void>(resolve => {
          effects.setSearchMode$.subscribe({ next: a => emitted.push(a), complete: resolve });
        });

        expect(emitted).toHaveLength(0);
      });
    });

    describe('switching to exact', () => {
      it('dispatches loadHouses with page 1 and current name from store', async () => {
        store.overrideSelector(selectAllHousesLoaded, false);
        store.overrideSelector(selectName, 'lannister');
        store.refreshState();

        actions$ = of(HousesActions.setSearchMode({ mode: 'exact' }));

        const action = await firstValueFrom(effects.setSearchMode$);

        expect(action).toEqual(
          HousesActions.loadHouses({ page: 1, pageSize: 10, name: 'lannister' }),
        );
      });

      it('dispatches loadHouses with empty name when store has no term', async () => {
        store.overrideSelector(selectAllHousesLoaded, false);
        store.overrideSelector(selectName, '');
        store.refreshState();

        actions$ = of(HousesActions.setSearchMode({ mode: 'exact' }));

        const action = await firstValueFrom(effects.setSearchMode$);

        expect(action).toEqual(
          HousesActions.loadHouses({ page: 1, pageSize: 10, name: '' }),
        );
      });
    });
  });
});
