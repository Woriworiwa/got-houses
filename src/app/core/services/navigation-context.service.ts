import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationContextService {
  readonly fromFavorites = signal(false);
}
