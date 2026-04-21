import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  loadHouses,
  SearchMode,
  setContainsPage,
  setSearchMode,
  setSearchName,
} from '../../../store/houses/houses.actions';
import {
  selectDisplayedHouses,
  selectDisplayTotalCount,
  selectHousesError,
  selectHousesLoading,
  selectName,
  selectPagination,
  selectSearchMode,
} from '../../../store/houses/houses.selectors';

@Component({
  selector: 'app-houses-list',
  templateUrl: './houses-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonToggleModule,
  ],
})
export class HousesListComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private subscription?: Subscription;

  protected readonly displayedColumns = ['name', 'region', 'words', 'seats'];
  protected readonly searchControl = new FormControl('');

  protected readonly houses = this.store.selectSignal(selectDisplayedHouses);
  protected readonly loading = this.store.selectSignal(selectHousesLoading);
  protected readonly error = this.store.selectSignal(selectHousesError);
  protected readonly pagination = this.store.selectSignal(selectPagination);
  protected readonly totalCount = this.store.selectSignal(selectDisplayTotalCount);
  protected readonly name = this.store.selectSignal(selectName);
  protected readonly searchMode = this.store.selectSignal(selectSearchMode);

  ngOnInit(): void {
    this.store.dispatch(loadHouses({ page: 1, pageSize: 10 }));

    this.subscription = this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(value => {
      const term = value ?? '';
      if (this.searchMode() === 'contains') {
        this.store.dispatch(setSearchName({ name: term }));
      } else {
        this.store.dispatch(loadHouses({
          page: 1,
          pageSize: this.pagination().pageSize,
          name: term,
        }));
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected onModeChange(mode: SearchMode): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.store.dispatch(setSearchMode({ mode }));
  }

  protected onPageChange(event: PageEvent): void {
    if (this.searchMode() === 'contains') {
      this.store.dispatch(setContainsPage({ page: event.pageIndex + 1, pageSize: event.pageSize }));
    } else {
      this.store.dispatch(loadHouses({
        page: event.pageIndex + 1,
        pageSize: event.pageSize,
        name: this.name(),
      }));
    }
  }
}
