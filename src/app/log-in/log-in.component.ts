import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [RouterLink, FooterComponent, ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LogInComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);
  private toastService = inject(ToastService);
  isSmallScreen = false;
  showPassword = false;

  form = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
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

  login() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.toastService.success('Login successful!');
        this.router.navigate(['/videoflix']);
      },
      error: (err) => {
        const errorMessage = err.error?.detail || 'Please check your input and try again.';
        this.toastService.error(errorMessage);
      }
    });
  }
}
