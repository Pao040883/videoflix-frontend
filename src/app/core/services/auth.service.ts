import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Signal, signal } from '@angular/core';
import { catchError, map, tap, throwError, EMPTY } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = inject(API_BASE_URL);

  private _accessToken = signal<string | null>(null);
  private _isAuthenticated = signal(false);

  public readonly isAuthenticated: Signal<boolean> =
    this._isAuthenticated.asReadonly();
  readonly accessToken: Signal<string | null> = this._accessToken.asReadonly();

  login(email: string, password: string) {
    return this.http
      .post<{ access: string }>(
        `${this.baseUrl}login/`,
        { email, password },
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          this._accessToken.set(response.access);
          this._isAuthenticated.set(true);
        })
      );
  }

  refresh() {
    return this.http
      .post<{ access: string }>(
        `${this.baseUrl}refresh/`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap({
          next: (response) => {
            this._accessToken.set(response.access);
            this._isAuthenticated.set(true); // ← wichtig!
          },
          error: () => {
            this._accessToken.set(null);
            this._isAuthenticated.set(false);
          },
        }),
        catchError(() => EMPTY)
      );
  }

  logout() {
    return this.http
      .post(`${this.baseUrl}logout/`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this._accessToken.set(null);
          this._isAuthenticated.set(false);
          this.router.navigate(['/log-in']);
        })
      );
  }

  checkAuth() {
    // Beispiel: API /me/ prüfen
    return this.http.get(`${this.baseUrl}me/`, { withCredentials: true }).pipe(
      tap({
        next: () => this._isAuthenticated.set(true),
        error: () => this._isAuthenticated.set(false),
      })
    );
  }

  getAccessToken(): string | null {
    return this._accessToken();
  }

   resetPassword(email: string) {
    return this.http
      .post<{ message: string }>(
        `${this.baseUrl}reset-password/`,
        { email },
        { withCredentials: true }
      )
      .pipe(
        map(() => void 0),
        catchError((err) => throwError(() => err))
      );
  }

  resetPasswordConfirm(
    uid: string,
    token: string,
    password1: string,
    password2: string
  ) {
    return this.http
      .post<{ message: string }>(
        `${this.baseUrl}reset-password-confirm/`,
        {
          uid: uid,
          token: token,
          new_password1: password1,
          new_password2: password2,
        },
        { withCredentials: true }
      )
      .pipe(
        map((res) => res.message),
        catchError((err) => throwError(() => err))
      );
  }

  register(email: string, password: string, confirmPassword: string) {
    return this.http
      .post<{ message: string }>(
        `${this.baseUrl}register/`,
        { 
          email, 
          password, 
          confirm_password: confirmPassword 
        }
      )
      .pipe(
        map((res) => res.message),
        catchError((err) => throwError(() => err))
      );
  }

  activateAccount(uid: string, token: string) {
    return this.http
      .get<{ message: string }>(
        `${this.baseUrl}activate/${uid}/${token}/`
      )
      .pipe(
        map((res) => res.message),
        catchError((err) => throwError(() => err))
      );
  }

}
