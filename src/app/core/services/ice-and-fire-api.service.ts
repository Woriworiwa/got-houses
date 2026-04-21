import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { expand, map, reduce } from 'rxjs/operators';
import { House } from '../models/house.model';
import { PaginationMeta } from '../models/pagination.model';

interface PageResult {
  houses: House[];
  hasNext: boolean;
  nextPage: number;
}

@Injectable({ providedIn: 'root' })
export class IceAndFireApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = 'https://anapioficeandfire.com/api';

  getHouses(page: number, pageSize: number, name = ''): Observable<{ houses: House[]; pagination: PaginationMeta }> {
    const params: Record<string, string | number> = { page, pageSize };
    if (name) params['name'] = name;

    return this.http
      .get<House[]>(`${this.BASE}/houses`, { params, observe: 'response' })
      .pipe(
        map(response => ({
          houses: response.body ?? [],
          pagination: {
            currentPage: page,
            pageSize,
            totalCount: this.parseTotalCount(response.headers.get('Link'), page, pageSize),
          },
        })),
      );
  }

  getAllHouses(): Observable<House[]> {
    return this.fetchPage(1).pipe(
      expand(({ hasNext, nextPage }) => (hasNext ? this.fetchPage(nextPage) : EMPTY)),
      reduce((all, { houses }) => [...all, ...houses], [] as House[]),
    );
  }

  getHouse(id: number): Observable<House> {
    return this.http.get<House>(`${this.BASE}/houses/${id}`);
  }

  private fetchPage(page: number): Observable<PageResult> {
    return this.http
      .get<House[]>(`${this.BASE}/houses`, {
        params: { page, pageSize: 50 },
        observe: 'response',
      })
      .pipe(
        map(response => ({
          houses: response.body ?? [],
          hasNext: this.hasNextLink(response.headers.get('Link')),
          nextPage: page + 1,
        })),
      );
  }

  private hasNextLink(linkHeader: string | null): boolean {
    if (!linkHeader) return false;
    return linkHeader.split(',').some(part => part.trim().split(';')[1]?.trim() === 'rel="next"');
  }

  private parseTotalCount(linkHeader: string | null, currentPage: number, pageSize: number): number {
    if (!linkHeader) return currentPage * pageSize;

    for (const part of linkHeader.split(',')) {
      const [urlPart, relPart] = part.trim().split(';');
      if (relPart?.trim() === 'rel="last"') {
        const match = urlPart.match(/page=(\d+)/);
        if (match) return Number(match[1]) * pageSize;
      }
    }

    return currentPage * pageSize;
  }
}
