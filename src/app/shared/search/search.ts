import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { House } from '../../core/models/house.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class SearchComponent implements OnInit {
  readonly suggestions = input.required<House[]>();
  readonly allHousesLoaded = input.required<boolean>();
  readonly placeholder = input<string>('Search houses…');

  readonly searchChange = output<string>();
  readonly suggestionSelect = output<House>();
  readonly focused = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly searchControl = new FormControl('');
  protected readonly showDropdown = signal(false);
  protected readonly isFocused = signal(false);

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        const term = value ?? '';
        this.showDropdown.set(!!term.trim());
        this.searchChange.emit(term);
      });
  }

  protected onFocus(): void {
    this.isFocused.set(true);
    this.focused.emit();
    if (this.searchControl.value?.trim()) {
      this.showDropdown.set(true);
    }
  }

  protected onBlur(): void {
    this.isFocused.set(false);
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      this.inputRef().nativeElement.focus();
    }
  }

  protected onSuggestionClick(house: House): void {
    this.showDropdown.set(false);
    this.searchControl.setValue(house.name, { emitEvent: false });
    this.suggestionSelect.emit(house);
  }
}
