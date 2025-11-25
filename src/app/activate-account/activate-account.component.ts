import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.scss'
})
export class ActivateAccountComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = true;
  success = false;
  message = '';

  ngOnInit(): void {
    const uid = this.route.snapshot.paramMap.get('uid');
    const token = this.route.snapshot.paramMap.get('token');

    if (uid && token) {
      this.authService.activateAccount(uid, token).subscribe({
        next: (msg) => {
          this.success = true;
          this.message = msg;
          this.loading = false;
          
          // Nach 3 Sekunden zum Login weiterleiten
          setTimeout(() => {
            this.router.navigate(['/log-in']);
          }, 3000);
        },
        error: (err) => {
          this.success = false;
          this.message = err.error?.error || 'Aktivierung fehlgeschlagen.';
          this.loading = false;
        }
      });
    } else {
      this.success = false;
      this.message = 'Ungültiger Aktivierungslink.';
      this.loading = false;
    }
  }
}
