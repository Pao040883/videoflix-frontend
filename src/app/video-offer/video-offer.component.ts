import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { VideoService } from '../core/services/video.service';
import { DragScrollDirective } from '../core/directives/drag-scroll.directive';
import { Router } from '@angular/router';
import { Video, VideoDetail } from '../core/models/video.model';
import { getMediaUrl } from '../core/utils/media-url.util';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

@Component({
  selector: 'app-video-offer',
  standalone: true,
  imports: [RouterLink, DragScrollDirective],
  templateUrl: './video-offer.component.html',
  styleUrl: './video-offer.component.scss'
})
export class VideoOfferComponent implements OnInit, AfterViewInit, OnDestroy {
  private auth = inject(AuthService);
  private videoService = inject(VideoService);
  private router = inject(Router);

  // ViewChild für das Hero-Video
  @ViewChild('heroVideo') heroVideoElement?: ElementRef<HTMLVideoElement>;
  
  // Video.js Player instance
  private player?: Player;

  // Helper function for media URLs - expose to template
  getMediaUrl = getMediaUrl;

  // Signals für Component-State
  showLeftShadow = false;
  showRightShadow = true;

  // Featured Video vom Service
  featuredVideo = this.videoService.featuredVideo;
  
  // Videos gruppiert nach Genre vom Service
  videosByGenre = this.videoService.videosByGenre;
  
  // Loading State
  loading = this.videoService.loading;

  // Computed: Konvertiere videosByGenre in Array für Template
  sections = computed(() => {
    const genreData = this.videosByGenre();
    const genreSections = Object.entries(genreData).map(([genreName, data]) => ({
      title: genreName,
      genre_id: data.genre_id,
      genre_slug: data.genre_slug,
      items: data.videos
    }));
    
    // Sammle alle Videos für "New on Videoflix"
    const allVideos = genreSections.flatMap(section => section.items);
    const newest = allVideos
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
    
    // Füge "New on Videoflix" am Anfang hinzu
    if (newest.length > 0) {
      return [
        { title: 'New on Videoflix', genre_id: null, genre_slug: 'new', items: newest },
        ...genreSections
      ];
    }
    return genreSections;
  });

  // Track shadow visibility per section
  leftShadow: boolean[] = [];
  rightShadow: boolean[] = [];

  ngOnInit(): void {
    // Lade Featured Video
    this.videoService.getFeaturedVideo().subscribe({
      error: (err) => console.error('Error loading featured video:', err)
    });

    // Lade Videos nach Genre
    this.videoService.getVideosByGenre().subscribe({
      next: () => {
        // Initialisiere Shadow-Arrays nach dem Laden
        const sectionCount = this.sections().length;
        this.leftShadow = new Array(sectionCount).fill(false);
        this.rightShadow = new Array(sectionCount).fill(true);
      },
      error: (err) => console.error('Error loading videos:', err)
    });
  }

  ngAfterViewInit(): void {
    // Warte kurz, bis das Template vollständig gerendert ist
    setTimeout(() => {
      if (this.heroVideoElement) {
        const videoElement = this.heroVideoElement.nativeElement;
        const featured = this.featuredVideo();
        
        if (featured) {
          // Get best quality for screen
          const bestQuality = this.getBestQualityForScreen();
          const videoUrl = featured.video_urls[bestQuality] || featured.video_urls['720p'] || featured.video_urls['original'];
          
          if (videoUrl) {
            // Initialize Video.js player
            const posterUrl = featured.preview_image || featured.thumbnail;
            this.player = videojs(videoElement, {
              controls: false,
              autoplay: true,
              muted: true,
              preload: 'auto',
              fluid: false,
              responsive: false,
              fill: true,
              poster: posterUrl ? this.getMediaUrl(posterUrl) || '' : '',
              sources: [{
                src: this.getMediaUrl(videoUrl) || '',
                type: videoUrl.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
              }]
            });

            // Auto-pause after 5 seconds
            this.player.ready(() => {
              const playPromise = (this.player as any)?.play();
              if (playPromise) {
                playPromise.then(() => {
                  setTimeout(() => {
                    if (this.player && !this.player.isDisposed()) {
                      this.player.pause();
                    }
                  }, 5000);
                }).catch((err: Error) => {
                });
              }
            });
          }
        }
      }
    }, 500);
  }

  private getBestQualityForScreen(): string {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    // Wähle Qualität basierend auf Viewport-Größe (nicht DPR, für besseres Testing)
    // Nutze die kleinere Dimension für die Entscheidung
    const relevantDimension = Math.min(screenHeight, screenWidth);
    
    if (screenHeight >= 1440 && screenWidth >= 2560) {
      return '1080p';  // 4K/Large displays
    } else if (screenHeight >= 1080 && screenWidth >= 1920) {
      return '1080p';  // Full HD displays
    } else if (screenHeight >= 720 && screenWidth >= 1280) {
      return '720p';   // HD displays
    } else if (relevantDimension >= 360) {
      return '360p';   // Mobile/Tablet
    } else {
      return '120p';   // Very small screens
    }
  }

  ngOnDestroy(): void {
    // Cleanup Video.js player
    if (this.player) {
      this.player.dispose();
    }
  }

  onScroll(container: HTMLElement) {
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    const threshold = 10;

    this.showLeftShadow = scrollLeft > threshold;
    this.showRightShadow = scrollLeft < scrollWidth - clientWidth - threshold;
  }

  // New: index-aware scroll handler
  onScrollAtIndex(index: number, container: HTMLElement) {
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const threshold = 10;
    this.leftShadow[index] = scrollLeft > threshold;
    this.rightShadow[index] = scrollLeft < scrollWidth - clientWidth - threshold;
  }

  // New: scrollBy buttons
  scrollBy(index: number, direction: -1 | 1) {
    const containers = document.querySelectorAll('.scroll-container');
    const el = containers[index] as HTMLElement | undefined;
    if (!el) return;
    const cardWidth = 213; // sync with SCSS
    const gap = 32;        // sync with SCSS
    const viewport = el.clientWidth;
    const itemsPerView = Math.max(1, Math.floor((viewport - 96 * 2 + gap) / (cardWidth + gap)));
    const delta = (cardWidth + gap) * itemsPerView * direction;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }

  // New: play featured video action
  playFeatured() {
    const featured = this.featuredVideo();
    if (featured) {
      this.router.navigate(['/video', featured.id]);
    }
  }

  // Update featured video preview (load full details)
  playVideo(video: Video) {
    this.videoService.getVideo(video.id).subscribe({
      next: (videoDetail) => {
        this.videoService.setFeaturedVideo(videoDetail);
        this.updatePlayerSource(videoDetail);
      },
      error: (err) => console.error('Error loading video:', err)
    });
  }

  // Update player source without reinitializing
  private updatePlayerSource(videoDetail: VideoDetail) {
    if (!this.player || this.player.isDisposed()) {
      setTimeout(() => this.reinitPlayer(), 100);
      return;
    }
    const bestQuality = this.getBestQualityForScreen();
    const videoUrl = videoDetail.video_urls[bestQuality] || videoDetail.video_urls['720p'];
    if (!videoUrl) return;
    const posterUrl = videoDetail.preview_image || videoDetail.thumbnail;
    if (posterUrl) this.player.poster(this.getMediaUrl(posterUrl) || '');
    this.player.src({ src: this.getMediaUrl(videoUrl) || '', 
      type: videoUrl.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4' });
    this.player.load();
    const playPromise = (this.player as any)?.play();
    if (playPromise) {
      playPromise.then(() => {
        setTimeout(() => {
          if (this.player && !this.player.isDisposed()) this.player.pause();
        }, 5000);
      }).catch(() => {});
    }
  }

  // Reinitialize Video.js player with new featured video
  private reinitPlayer() {
    if (!this.heroVideoElement) return;
    const videoElement = this.heroVideoElement.nativeElement;
    if (!document.body.contains(videoElement)) return;
    if (this.player && !this.player.isDisposed()) this.player.dispose();
    const featured = this.featuredVideo();
    if (!featured) return;
    const bestQuality = this.getBestQualityForScreen();
    const videoUrl = featured.video_urls[bestQuality] || featured.video_urls['720p'];
    if (!videoUrl) return;
    const posterUrl = featured.preview_image || featured.thumbnail;
    this.player = videojs(videoElement, {
      controls: false, autoplay: true, muted: true, preload: 'auto',
      fluid: false, responsive: false, fill: true,
      poster: posterUrl ? this.getMediaUrl(posterUrl) || '' : '',
      sources: [{ src: this.getMediaUrl(videoUrl) || '', 
        type: videoUrl.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4' }]
    });
    this.player.ready(() => {
      const playPromise = (this.player as any)?.play();
      if (playPromise) {
        playPromise.then(() => {
          setTimeout(() => {
            if (this.player && !this.player.isDisposed()) this.player.pause();
          }, 5000);
        }).catch(() => {});
      }
    });
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
