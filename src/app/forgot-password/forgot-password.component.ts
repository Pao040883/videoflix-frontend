import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FooterComponent, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private toastService = inject(ToastService);
  isSmallScreen = false;
  showPassword = false;

  form = new FormGroup({
    email: new FormControl('', [Validators.required]),
  });

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

  resetPassword() {
    if (this.form.invalid) {
      return;
    }

    this.auth.resetPassword(this.form.value.email!).subscribe({
      next: (response: any) => {
        const message = response?.message || response?.detail || 'Password reset email sent. Please check your inbox.';
        this.toastService.success(message);
        this.form.reset();
      },
      error: (err: any) => {
        const message = err.error?.message || err.error?.detail || 'If an account exists, you will receive a reset link.';
        this.toastService.success(message);
        this.form.reset();
      },
    });
  }
}
