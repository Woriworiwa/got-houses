import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { FavoritesStore } from './features/favorites/favorites.store';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
  ],
  template: `
    <mat-toolbar color="primary" role="navigation" aria-label="Main navigation">
      <a
        mat-button
        routerLink="/houses"
        routerLinkActive="mat-accent"
        [routerLinkActiveOptions]="{ exact: false }"
        aria-label="Houses of Westeros"
      >
        <mat-icon>castle</mat-icon>
        Houses
      </a>
      <span class="flex-1"></span>
      <a
        mat-button
        routerLink="/favorites"
        routerLinkActive="mat-accent"
        [routerLinkActiveOptions]="{ exact: false }"
        aria-label="My Favorites"
      >
        <mat-icon
          [matBadge]="favoriteCount()"
          [matBadgeHidden]="favoriteCount() === 0"
          matBadgeColor="warn"
          matBadgeSize="small"
          aria-hidden="true"
        >favorite</mat-icon>
        Favorites
      </a>
    </mat-toolbar>
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly favoritesStore = inject(FavoritesStore);
  protected readonly favoriteCount = this.favoritesStore.favoriteCount;
}
