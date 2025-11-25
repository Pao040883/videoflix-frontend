import { InjectionToken } from '@angular/core';

// Docker-ready: can be overridden by window.__env.API_BASE_URL at runtime
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => (typeof window !== 'undefined' && (window as any).__env?.API_BASE_URL) || 'http://localhost:8000/api/',
});
