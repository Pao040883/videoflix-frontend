import { InjectionToken } from '@angular/core';

// Docker-ready: can be overridden by window.__env.API_BASE_URL at runtime
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => {
    // Runtime override möglich via window.__env
    if (typeof window !== 'undefined' && (window as any).__env?.API_BASE_URL) {
      return (window as any).__env.API_BASE_URL;
    }
    // Production: relative URLs (same domain)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return '/api/';
    }
    // Development: localhost backend
    return 'http://localhost:8000/api/';
  },
});
