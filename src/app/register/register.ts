import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.html',
})
export class RegisterComponent {
  protected readonly authService = inject(AuthService);

  protected readonly form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { name, email, password } = this.form.getRawValue();
    this.authService.register(email!, password!, name!);
  }
}
