import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'houses',
    loadChildren: () =>
      import('./features/houses/houses.routes').then(m => m.HOUSES_ROUTES),
  },
  { path: '**', redirectTo: 'houses' },
];
