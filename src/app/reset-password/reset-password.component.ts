import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const group = control as FormGroup;
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;

  return pw === confirm ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, FooterComponent, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  isSmallScreen = false;
  showPassword = false;
  showConfirmPassword = false;
  successMessage = '';
  errorMessage = '';
  uid = '';
  token = '';

  form = new FormGroup(
    {
      password: new FormControl('', {
        nonNullable: true,
        validators: Validators.required,
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

  ngOnInit() {
    this.uid = this.route.snapshot.paramMap.get('id') || '';
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  togglePasswort() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswort() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const password = this.form.value.password!;
    const confirmPassword = this.form.value.confirmPassword!;

    this.authService
      .resetPasswordConfirm(this.uid, this.token, password, confirmPassword)
      .subscribe({
        next: (message) => {
          this.successMessage = 'Passwort erfolgreich zurückgesetzt!';
          setTimeout(() => {
            this.router.navigate(['/log-in']);
          }, 3000);
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message ||
            err.error?.error ||
            'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
        },
      });
  }
}
