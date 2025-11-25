import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const group = control as FormGroup;
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;

  return pw === confirm ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterLink, FooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isSmallScreen = false;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  form = new FormGroup(
    {
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: Validators.required,
      }),
    },
    {
      validators: passwordMatchValidator,
    }
  );

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result) => {
        this.isSmallScreen = result.matches;
      });
  }

  togglePasswort() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswort() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submit() {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { email, password, confirmPassword } = this.form.getRawValue();

      this.authService.register(email, password, confirmPassword).subscribe({
        next: (message) => {
          this.successMessage = message;
          this.form.reset();
          // Optional: Nach 3 Sekunden zum Login weiterleiten
          setTimeout(() => {
            this.router.navigate(['/log-in']);
          }, 3000);
        },
        error: (err) => {
          console.error('Registration error:', err);
          if (err.error?.email) {
            this.errorMessage = err.error.email[0];
          } else if (err.error?.confirm_password) {
            this.errorMessage = err.error.confirm_password[0];
          } else {
            this.errorMessage = 'Bitte überprüfe deine Eingaben und versuche es erneut.';
          }
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }
}
