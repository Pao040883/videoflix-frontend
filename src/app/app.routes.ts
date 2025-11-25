import { Routes } from '@angular/router';
import { StartpageComponent } from './startpage/startpage.component';
import { LogInComponent } from './log-in/log-in.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VideoOfferComponent } from './video-offer/video-offer.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: StartpageComponent },
  { path: 'log-in', component: LogInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'activate/:uid/:token', component: ActivateAccountComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:id/:token', component: ResetPasswordComponent },
  { path: 'videoflix', component: VideoOfferComponent, canActivate: [authGuard] },
  { path: 'video/:id', component: VideoPlayerComponent, canActivate: [authGuard] },
  { path: 'imprint', component: ImprintComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
];
