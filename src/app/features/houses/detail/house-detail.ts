import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HousesStore } from '../houses.store';

@Component({
  selector: 'app-house-detail',
  templateUrl: './house-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
})
export class HouseDetailComponent {
  protected readonly store = inject(HousesStore);

  readonly id = input.required<string>();

  protected readonly house = this.store.selectedHouse;
  protected readonly loading = this.store.selectedHouseLoading;
  protected readonly error = this.store.selectedHouseError;

  constructor() {
    effect(() => {
      this.store.loadHouseDetail(Number(this.id()));
    });
  }
}
