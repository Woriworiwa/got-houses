import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { House } from '../../core/models/house.model';

@Component({
  selector: 'app-house-card',
  templateUrl: './house-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class HouseCardComponent {
  readonly house = input.required<House>();
  readonly isFavorite = input.required<boolean>();
  readonly detailLink = input.required<(string | number)[]>();
  readonly favoriteToggle = output<void>();
}
