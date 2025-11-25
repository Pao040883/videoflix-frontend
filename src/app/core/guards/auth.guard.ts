// import { CanActivateFn } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   return true;
// };

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { of, switchMap, catchError } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wenn kein Access-Token vorhanden ist → versuche Refresh
  const token = authService.getAccessToken();

  const refreshOrCheck$ = token
    ? authService.checkAuth() // wenn Token da → prüfen
    : authService.refresh().pipe(
        // sonst Token holen, dann prüfen
        switchMap(() => authService.checkAuth())
      );

  return refreshOrCheck$.pipe(
    catchError(() => {
      router.navigate(['/log-in']);
      return of(false);
    }),
    switchMap(() => {
      if (authService.isAuthenticated()) {
        return of(true);
      } else {
        router.navigate(['/log-in']);
        return of(false);
      }
    })
  );
};
