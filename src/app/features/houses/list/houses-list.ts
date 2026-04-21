import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { loadHouses } from '../../../store/houses/houses.actions';
import {
  selectHousesError,
  selectHousesList,
  selectHousesLoading,
  selectPagination,
} from '../../../store/houses/houses.selectors';

@Component({
  selector: 'app-houses-list',
  templateUrl: './houses-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTableModule, MatPaginatorModule, MatCardModule],
})
export class HousesListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly displayedColumns = ['name', 'region', 'words', 'seats'];

  protected readonly houses = this.store.selectSignal(selectHousesList);
  protected readonly loading = this.store.selectSignal(selectHousesLoading);
  protected readonly error = this.store.selectSignal(selectHousesError);
  protected readonly pagination = this.store.selectSignal(selectPagination);

  ngOnInit(): void {
    this.store.dispatch(loadHouses({ page: 1, pageSize: 10 }));
  }

  protected onPageChange(event: PageEvent): void {
    this.store.dispatch(loadHouses({ page: event.pageIndex + 1, pageSize: event.pageSize }));
  }
}
