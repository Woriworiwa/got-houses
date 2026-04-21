import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'houses',
    loadComponent: () => import('./list/list').then((m) => m.HousesListComponent),
  },
  {
    path: 'houses/:id',
    loadComponent: () => import('./detail/detail').then((m) => m.HouseDetailComponent),
  },
  {
    path: 'favorites',
    loadComponent: () => import('./favorites/favorites-list').then((m) => m.FavoritesListComponent),
  },
  { path: '**', redirectTo: 'houses' },
];
