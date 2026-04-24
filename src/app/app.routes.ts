import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/authentication/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/authentication/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'houses',
    loadComponent: () => import('./features/houses/list/list').then((m) => m.HousesListComponent),
  },
  {
    path: 'houses/:id',
    loadComponent: () => import('./features/houses/detail/detail').then((m) => m.HouseDetailComponent),
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/houses/favorites/favorites-list').then((m) => m.FavoritesListComponent),
  },
  { path: '**', redirectTo: 'houses' },
];
