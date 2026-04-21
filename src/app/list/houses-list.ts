import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { houseIdFromUrl } from '../core/models/house.model';
import { HousesStore, SearchMode } from '../core/stores/houses.store';
import { FavoritesStore } from '../core/stores/favorites.store';

@Component({
  selector: 'app-houses-list',
  templateUrl: './houses-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
  ],
})
export class HousesListComponent implements OnInit {
  protected readonly store = inject(HousesStore);
  protected readonly favoritesStore = inject(FavoritesStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly houseIdFromUrl = houseIdFromUrl;
  protected readonly displayedColumns = ['name', 'region', 'words', 'seats', 'favorite'];
  protected readonly searchControl = new FormControl('');

  protected readonly houses = this.store.displayedHouses;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly pagination = this.store.pagination;
  protected readonly totalCount = this.store.displayTotalCount;
  protected readonly name = this.store.name;
  protected readonly searchMode = this.store.searchMode;

  ngOnInit(): void {
    this.store.loadHouses({ page: 1, pageSize: 10 });

    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        const term = value ?? '';
        if (this.searchMode() === 'partial') {
          this.store.setSearchName(term);
        } else {
          this.store.loadHouses({
            page: 1,
            pageSize: this.pagination().pageSize,
            name: term,
          });
        }
      });
  }

  protected onSearchModeChange(mode: SearchMode): void {
    this.store.setSearchMode(mode);

    const term = this.searchControl.value ?? '';
    if (term) {
      this.store.setSearchName(term);
    }
  }

  protected onPageChange(event: PageEvent): void {
    if (this.searchMode() === 'partial') {
      this.store.setContainsPage(event.pageIndex + 1, event.pageSize);
    } else {
      this.store.loadHouses({
        page: event.pageIndex + 1,
        pageSize: event.pageSize,
        name: this.name(),
      });
    }
  }
}
