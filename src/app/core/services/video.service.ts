import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from '../config/api.config';
import { Video, VideoDetail, VideosByGenre, Genre } from '../models/video.model';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  // Signals für reaktive Datenhaltung
  videos = signal<Video[]>([]);
  videosByGenre = signal<VideosByGenre>({});
  featuredVideo = signal<VideoDetail | null>(null);
  genres = signal<Genre[]>([]);
  loading = signal<boolean>(false);

  /**
   * Lädt alle Videos
   */
  getVideos(): Observable<Video[]> {
    this.loading.set(true);
    return this.http.get<Video[]>(`${this.baseUrl}videos/`).pipe(
      tap(videos => {
        this.videos.set(videos);
        this.loading.set(false);
      })
    );
  }

  /**
   * Lädt ein einzelnes Video
   */
  getVideo(id: number): Observable<VideoDetail> {
    this.loading.set(true);
    return this.http.get<VideoDetail>(`${this.baseUrl}videos/${id}/`).pipe(
      tap(() => this.loading.set(false))
    );
  }

  /**
   * Lädt Videos gruppiert nach Genre
   */
  getVideosByGenre(): Observable<VideosByGenre> {
    this.loading.set(true);
    return this.http.get<VideosByGenre>(`${this.baseUrl}videos/by_genre/`).pipe(
      tap(data => {
        this.videosByGenre.set(data);
        this.loading.set(false);
      })
    );
  }

  /**
   * Lädt das Featured Video
   */
  getFeaturedVideo(): Observable<VideoDetail> {
    this.loading.set(true);
    return this.http.get<VideoDetail>(`${this.baseUrl}videos/featured/`).pipe(
      tap(video => {
        this.featuredVideo.set(video);
        this.loading.set(false);
      })
    );
  }

  /**
   * Lädt alle Genres
   */
  getGenres(): Observable<Genre[]> {
    this.loading.set(true);
    return this.http.get<Genre[]>(`${this.baseUrl}genres/`).pipe(
      tap(genres => {
        this.genres.set(genres);
        this.loading.set(false);
      })
    );
  }

  /**
   * Sucht nach Videos
   */
  searchVideos(query: string): Observable<Video[]> {
    this.loading.set(true);
    return this.http.get<Video[]>(`${this.baseUrl}videos/?search=${query}`).pipe(
      tap(() => this.loading.set(false))
    );
  }
}
