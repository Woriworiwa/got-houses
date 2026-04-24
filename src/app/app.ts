import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FavoritesStore } from './core/stores/favorites.store';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly favoritesStore = inject(FavoritesStore);
  protected readonly authService = inject(AuthService);
  protected readonly favoriteCount = this.favoritesStore.favoriteCount;

  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.authService.restoreSession();
    }
  }
}
