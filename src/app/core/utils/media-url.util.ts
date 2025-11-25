import { inject } from '@angular/core';
import { API_BASE_URL } from '../config/api.config';

/**
 * Converts a relative media URL to an absolute URL using the backend base URL
 * Example: "/media/videos/video.mp4" -> "http://localhost:8000/media/videos/video.mp4"
 */
export function getMediaUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  
  // If already absolute, return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Get backend URL (remove /api/ suffix if present)
  const baseUrl = getBackendBaseUrl();
  
  // Remove leading slash from relative path if present
  const path = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  return `${baseUrl}${path}`;
}

/**
 * Gets the backend base URL without /api/ suffix
 */
function getBackendBaseUrl(): string {
  // Runtime override möglich via window.__env
  if (typeof window !== 'undefined' && (window as any).__env?.API_BASE_URL) {
    return (window as any).__env.API_BASE_URL.replace(/\/api\/$/, '/');
  }
  
  // Production: same domain
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin + '/';
  }
  
  // Development: localhost backend
  return 'http://localhost:8000/';
}
