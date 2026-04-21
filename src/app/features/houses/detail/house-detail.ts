import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { loadHouseDetail } from '../../../store/houses/houses.actions';
import {
  selectSelectedHouse,
  selectSelectedHouseError,
  selectSelectedHouseLoading,
} from '../../../store/houses/houses.selectors';

@Component({
  selector: 'app-house-detail',
  templateUrl: './house-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
})
export class HouseDetailComponent {
  private readonly store = inject(Store);

  readonly id = input.required<string>();

  protected readonly house = this.store.selectSignal(selectSelectedHouse);
  protected readonly loading = this.store.selectSignal(selectSelectedHouseLoading);
  protected readonly error = this.store.selectSignal(selectSelectedHouseError);

  constructor() {
    effect(() => {
      this.store.dispatch(loadHouseDetail({ id: Number(this.id()) }));
    });
  }
}
