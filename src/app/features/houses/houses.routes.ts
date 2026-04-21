import { Routes } from '@angular/router';
import { HousesListComponent } from './list/houses-list';
import { HouseDetailComponent } from './detail/house-detail';

export const HOUSES_ROUTES: Routes = [
  { path: '', component: HousesListComponent },
  { path: ':id', component: HouseDetailComponent },
];
