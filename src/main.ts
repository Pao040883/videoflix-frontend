// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { AuthService } from './app/core/services/auth.service';
import { catchError, EMPTY } from 'rxjs';

bootstrapApplication(AppComponent, appConfig).then(appRef => {
  const injector = appRef.injector;
  const auth = injector.get(AuthService);

  // Only try refresh on startup if a refresh cookie is present.
  const hasRefreshCookie = document.cookie.includes('refresh_token=');
  if (hasRefreshCookie) {
    auth.refresh().pipe(catchError(() => EMPTY)).subscribe();
  }
});
