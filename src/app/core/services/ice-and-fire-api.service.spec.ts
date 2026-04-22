import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IceAndFireApiService } from './ice-and-fire-api.service';
import { House } from '../models/house.model';

// ── fixtures ──────────────────────────────────────────────────────────────────

const BASE = 'https://anapioficeandfire.com/api';

const makeHouse = (name: string, id = 1): House => ({
  url: `${BASE}/houses/${id}`,
  name,
  region: '',
  coatOfArms: '',
  words: '',
  titles: [],
  seats: [],
  currentLord: '',
  heir: '',
  overlord: '',
  founded: '',
  founder: '',
  diedOut: '',
  ancestralWeapons: [],
  cadetBranches: [],
  swornMembers: [],
});

// ── helpers ───────────────────────────────────────────────────────────────────

function buildLinkHeader(parts: { rel: string; page: number }[]): string {
  return parts
    .map(({ rel, page }) => `<${BASE}/houses?page=${page}&pageSize=50>; rel="${rel}"`)
    .join(', ');
}

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    service: TestBed.inject(IceAndFireApiService),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('IceAndFireApiService', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

describe('getHouses', () => {
    it('sends GET request with page and pageSize params', () => {
      const { service, httpMock } = setup();
      service.getHouses(2, 10).subscribe();

      const req = httpMock.expectOne((r) => r.url === `${BASE}/houses`);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush([]);
    });

    it('includes name param when provided', () => {
      const { service, httpMock } = setup();
      service.getHouses(1, 10, 'Stark').subscribe();

      const req = httpMock.expectOne((r) => r.url === `${BASE}/houses`);
      expect(req.request.params.get('name')).toBe('Stark');
      req.flush([]);
    });

    it('omits name param when empty string', () => {
      const { service, httpMock } = setup();
      service.getHouses(1, 10, '').subscribe();

      const req = httpMock.expectOne((r) => r.url === `${BASE}/houses`);
      expect(req.request.params.has('name')).toBe(false);
      req.flush([]);
    });

    it('maps response body to houses array', () => {
      const { service, httpMock } = setup();
      const houses = [makeHouse('House Stark', 1), makeHouse('House Lannister', 2)];
      let result: { houses: House[] } | undefined;
      service.getHouses(1, 10).subscribe((r) => (result = r));

      httpMock.expectOne((r) => r.url === `${BASE}/houses`).flush(houses);

      expect(result!.houses).toEqual(houses);
    });

    it('returns empty array when body is null', () => {
      const { service, httpMock } = setup();
      let result: { houses: House[] } | undefined;
      service.getHouses(1, 10).subscribe((r) => (result = r));

      httpMock.expectOne((r) => r.url === `${BASE}/houses`).flush(null);

      expect(result!.houses).toEqual([]);
    });

    it('sets currentPage and pageSize on pagination', () => {
      const { service, httpMock } = setup();
      let result: { pagination: { currentPage: number; pageSize: number } } | undefined;
      service.getHouses(3, 25).subscribe((r) => (result = r));

      httpMock.expectOne((r) => r.url === `${BASE}/houses`).flush([]);

      expect(result!.pagination.currentPage).toBe(3);
      expect(result!.pagination.pageSize).toBe(25);
    });

    it('computes totalCount from last link header', () => {
      const { service, httpMock } = setup();
      const linkHeader = buildLinkHeader([
        { rel: 'next', page: 2 },
        { rel: 'last', page: 5 },
      ]);
      let result: { pagination: { totalCount: number } } | undefined;
      service.getHouses(1, 10).subscribe((r) => (result = r));

      httpMock
        .expectOne((r) => r.url === `${BASE}/houses`)
        .flush([], { headers: { Link: linkHeader } });

      // last page is 5, pageSize is 10 => 50
      expect(result!.pagination.totalCount).toBe(50);
    });

    it('falls back to currentPage * pageSize when no last link', () => {
      const { service, httpMock } = setup();
      const linkHeader = buildLinkHeader([{ rel: 'next', page: 2 }]);
      let result: { pagination: { totalCount: number } } | undefined;
      service.getHouses(2, 10).subscribe((r) => (result = r));

      httpMock
        .expectOne((r) => r.url === `${BASE}/houses`)
        .flush([], { headers: { Link: linkHeader } });

      expect(result!.pagination.totalCount).toBe(20);
    });

    it('falls back to currentPage * pageSize when Link header is absent', () => {
      const { service, httpMock } = setup();
      let result: { pagination: { totalCount: number } } | undefined;
      service.getHouses(3, 10).subscribe((r) => (result = r));

      httpMock.expectOne((r) => r.url === `${BASE}/houses`).flush([]);

      expect(result!.pagination.totalCount).toBe(30);
    });
  });

  describe('getHouse', () => {
    it('fetches a single house by id', () => {
      const { service, httpMock } = setup();
      const house = makeHouse('House Stark', 42);
      let result: House | undefined;
      service.getHouse(42).subscribe((h) => (result = h));

      httpMock.expectOne(`${BASE}/houses/42`).flush(house);

      expect(result).toEqual(house);
    });
  });

  describe('getAllHouses', () => {
    it('returns all houses from a single page when there is no next link', () => {
      const { service, httpMock } = setup();
      const houses = [makeHouse('House Stark', 1), makeHouse('House Lannister', 2)];
      let result: House[] | undefined;
      service.getAllHouses().subscribe((h) => (result = h));

      httpMock
        .expectOne((r) => r.url === `${BASE}/houses` && r.params.get('page') === '1')
        .flush(houses);

      expect(result).toEqual(houses);
    });

    it('accumulates houses across multiple pages', () => {
      const { service, httpMock } = setup();
      const page1Houses = [makeHouse('House Stark', 1)];
      const page2Houses = [makeHouse('House Lannister', 2)];
      let result: House[] | undefined;
      service.getAllHouses().subscribe((h) => (result = h));

      // Page 1 — has next link
      const req1 = httpMock.expectOne((r) => r.url === `${BASE}/houses` && r.params.get('page') === '1');
      req1.flush(page1Houses, {
        headers: { Link: buildLinkHeader([{ rel: 'next', page: 2 }]) },
      });

      // Page 2 — no next link
      const req2 = httpMock.expectOne((r) => r.url === `${BASE}/houses` && r.params.get('page') === '2');
      req2.flush(page2Houses);

      expect(result).toEqual([...page1Houses, ...page2Houses]);
    });

    it('uses pageSize of 50 for each page request', () => {
      const { service, httpMock } = setup();
      service.getAllHouses().subscribe();

      const req = httpMock.expectOne((r) => r.url === `${BASE}/houses`);
      expect(req.request.params.get('pageSize')).toBe('50');
      req.flush([]);
    });

    it('returns empty array when first page returns no houses', () => {
      const { service, httpMock } = setup();
      let result: House[] | undefined;
      service.getAllHouses().subscribe((h) => (result = h));

      httpMock.expectOne((r) => r.url === `${BASE}/houses`).flush([]);

      expect(result).toEqual([]);
    });
  });
});
