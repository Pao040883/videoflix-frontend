// import { HttpInterceptorFn } from '@angular/common/http';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   return next(req);
// };

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../config/api.config';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiBase = inject(API_BASE_URL);
  const token = authService.getAccessToken();

  // Nur API-Requests anfassen
  const isApi = req.url.startsWith(apiBase);
  if (!isApi) {
    return next(req);
  }

  // Endpunkte, die keinen Bearer-Header brauchen
  const skipAuthHeader = [
    'login/',
    'refresh/',
    'reset-password/',
    'reset-password-confirm/',
  ].some((path) => req.url.startsWith(apiBase + path));

  const withHeaders = req.clone({
    withCredentials: true,
    setHeaders: !skipAuthHeader && token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(withHeaders).pipe(
    catchError((err: unknown) => {
      const error = err as HttpErrorResponse;
      const isUnauthorized = error.status === 401;
      const isRefreshCall = req.url.startsWith(apiBase + 'refresh/');

      // Bei 401: einmalig refreshen und wiederholen
      if (isApi && isUnauthorized && !isRefreshCall) {
        return authService.refresh().pipe(
          switchMap(() => {
            const newToken = authService.getAccessToken();
            const retryReq = withHeaders.clone({
              setHeaders: !skipAuthHeader && newToken ? { Authorization: `Bearer ${newToken}` } : {},
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => throwError(() => refreshErr))
        );
      }

      return throwError(() => error);
    })
  );
};

