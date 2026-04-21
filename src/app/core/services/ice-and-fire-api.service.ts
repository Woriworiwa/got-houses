import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { House } from '../models/house.model';
import { PaginationMeta } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class IceAndFireApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = 'https://anapioficeandfire.com/api';

  getHouses(page: number, pageSize: number): Observable<{ houses: House[]; pagination: PaginationMeta }> {
    return this.http
      .get<House[]>(`${this.BASE}/houses`, {
        params: { page, pageSize },
        observe: 'response',
      })
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

  getHouse(id: number): Observable<House> {
    return this.http.get<House>(`${this.BASE}/houses/${id}`);
  }

  private parseTotalCount(linkHeader: string | null, currentPage: number, pageSize: number): number {
    if (!linkHeader) return currentPage * pageSize;

    for (const part of linkHeader.split(',')) {
      const [urlPart, relPart] = part.trim().split(';');
      if (relPart?.trim() === 'rel="last"') {
        const match = urlPart.match(/page=(\d+)/);
        if (match) {
          return Number(match[1]) * pageSize;
        }
      }
    }

    return currentPage * pageSize;
  }
}
