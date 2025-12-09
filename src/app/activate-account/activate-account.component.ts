import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.scss'
})
export class ActivateAccountComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);

  loading = true;
  success = false;
  message = '';
  isSmallScreen = false;

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result) => (this.isSmallScreen = result.matches));
  }

  ngOnInit(): void {
    const uid = this.route.snapshot.paramMap.get('uid');
    const token = this.route.snapshot.paramMap.get('token');

    if (uid && token) {
      this.authService.activateAccount(uid, token).subscribe({
        next: (msg) => {
          this.success = true;
          this.message = msg;
          this.loading = false;
          
          // Redirect to login after a short delay
          setTimeout(() => {
            this.router.navigate(['/log-in']);
          }, 3000);
        },
        error: (err) => {
          this.success = false;
          this.message = err.error?.error || 'Activation failed. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.success = false;
      this.message = 'Invalid activation link.';
      this.loading = false;
    }
  }
}
