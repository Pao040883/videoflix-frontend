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
  isSmallScreen = false;
  showPassword = false;
  emailSent = false;
  errorMessage = '';

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

    this.errorMessage = '';
    this.emailSent = false;

    this.auth.resetPassword(this.form.value.email!).subscribe({
      next: () => {
        this.emailSent = true;
        this.form.reset();
      },
      error: (err) => {
        // Auch bei Fehler zeigen wir die Success-Message aus Sicherheitsgründen
        this.emailSent = true;
        this.form.reset();
      },
    });
  }
}
