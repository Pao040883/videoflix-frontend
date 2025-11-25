// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { AuthService } from './app/core/services/auth.service';

bootstrapApplication(AppComponent, appConfig).then(appRef => {
  const injector = appRef.injector;
  const auth = injector.get(AuthService);

  auth.refresh().subscribe({
    next: () => console.log('Token refreshed on startup'),
    error: () => console.warn('Token refresh failed')
  });
});
