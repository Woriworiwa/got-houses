import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { House, houseIdFromUrl } from '../models/house.model';
import { PaginationMeta } from '../models/pagination.model';
import { IceAndFireApiService } from '../services/ice-and-fire-api.service';

function extractErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    return `${err.status} ${err.statusText}`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

type EntitySlice = { entityMap: Record<number, House>; ids: number[] };

function upsertHouses(current: EntitySlice, incoming: House[]): EntitySlice {
  const entityMap = { ...current.entityMap };
  const idSet = new Set(current.ids);
  const ids = [...current.ids];
  for (const house of incoming) {
    const id = houseIdFromUrl(house.url);
    entityMap[id] = house;
    if (!idSet.has(id)) {
      idSet.add(id);
      ids.push(id);
    }
  }
  return { entityMap, ids };
}

export const HousesStore = signalStore(
  { providedIn: 'root' },

  withState({
    entityMap: {} as Record<number, House>,
    ids: [] as number[],
    currentPageIds: [] as number[],
    allHousesLoaded: false,
    loading: false,
    error: null as string | null,
    pagination: { currentPage: 1, pageSize: 10, totalCount: 0 } as PaginationMeta,
    name: '',
    selectedHouseId: null as number | null,
    selectedHouseLoading: false,
    selectedHouseError: null as string | null,
  }),

  withComputed((store) => ({
    entities: computed((): House[] =>
      store.ids().map((id) => store.entityMap()[id]).filter((h): h is House => h !== undefined),
    ),
    currentPageHouses: computed((): House[] => {
      const map = store.entityMap();
      return store.currentPageIds().map((id) => map[id]).filter((h): h is House => h !== undefined);
    }),
  })),

  withComputed((store) => ({
    containsFiltered: computed((): House[] => {
      if (!store.allHousesLoaded()) return [];
      const all = store.entities().slice().sort((a, b) => a.name.localeCompare(b.name));
      const term = store.name().toLowerCase().trim();
      if (!term) return all;
      return all.filter((h) => h.name.toLowerCase().includes(term));
    }),
    selectedHouse: computed((): House | null => {
      const id = store.selectedHouseId();
      if (id === null) return null;
      return store.entityMap()[id] ?? null;
    }),
  })),

  withMethods((store, api = inject(IceAndFireApiService)) => {
    const loadHouses = rxMethod<{ page: number; pageSize: number; name?: string }>(
      pipe(
        tap(({ name }) =>
          patchState(store, {
            loading: true,
            error: null,
            ...(name !== undefined ? { name } : {}),
          }),
        ),
        switchMap(({ page, pageSize, name }) =>
          api.getHouses(page, pageSize, name).pipe(
            tap(({ houses, pagination }) =>
              patchState(store, (state) => ({
                ...upsertHouses(state, houses),
                loading: false,
                currentPageIds: houses.map((h) => houseIdFromUrl(h.url)),
                pagination,
              })),
            ),
            catchError((err) => {
              patchState(store, { loading: false, error: extractErrorMessage(err) });
              return EMPTY;
            }),
          ),
        ),
      ),
    );

    const loadAllHouses = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          api.getAllHouses().pipe(
            tap((houses) =>
              patchState(store, (state) => ({
                ...upsertHouses(state, houses),
                loading: false,
                allHousesLoaded: true,
              })),
            ),
            catchError((err) => {
              patchState(store, { loading: false, error: extractErrorMessage(err) });
              return EMPTY;
            }),
          ),
        ),
      ),
    );

    const loadHouseDetail = rxMethod<number>(
      pipe(
        switchMap((id) => {
          const cached = store.entityMap()[id];
          if (cached) {
            patchState(store, { selectedHouseId: id, selectedHouseLoading: false, selectedHouseError: null });
            return EMPTY;
          }
          patchState(store, { selectedHouseLoading: true, selectedHouseError: null });
          return api.getHouse(id).pipe(
            tap((house) =>
              patchState(store, (state) => ({
                ...upsertHouses(state, [house]),
                selectedHouseLoading: false,
                selectedHouseId: houseIdFromUrl(house.url),
              })),
            ),
            catchError((err) => {
              patchState(store, {
                selectedHouseLoading: false,
                selectedHouseError: extractErrorMessage(err),
              });
              return EMPTY;
            }),
          );
        }),
      ),
    );

    const preloadHouse = rxMethod<number>(
      pipe(
        switchMap((id) => {
          if (store.entityMap()[id]) return EMPTY;
          return api.getHouse(id).pipe(
            tap((house) => patchState(store, (state) => ({ ...upsertHouses(state, [house]) }))),
            catchError(() => EMPTY),
          );
        }),
      ),
    );

    return {
      loadHouses,
      loadAllHouses,
      loadHouseDetail,
      preloadHouse,

      setSearchName(name: string): void {
        patchState(store, { name });
      },
    };
  }),
);
