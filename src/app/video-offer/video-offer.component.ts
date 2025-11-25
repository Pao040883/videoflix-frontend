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
    return Object.entries(genreData).map(([genreName, data]) => ({
      title: genreName,
      genre_id: data.genre_id,
      genre_slug: data.genre_slug,
      items: data.videos
    }));
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
            console.log(`Hero video - Selected quality: ${bestQuality} for screen height: ${window.innerHeight}px`);
            
            // Initialize Video.js player
            this.player = videojs(videoElement, {
              controls: false,
              autoplay: true,
              muted: true,
              preload: 'auto',
              fluid: false,
              responsive: false,
              fill: true,
              sources: [{
                src: this.getMediaUrl(videoUrl) || '',
                type: videoUrl.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
              }]
            });

            // Auto-pause after 5 seconds
            this.player.ready(() => {
              // TypeScript Workaround: Video.js play() ist nicht undefined nach ready()
              const playPromise = (this.player as any)?.play();
              if (playPromise) {
                playPromise.then(() => {
                  console.log('Hero video is playing with Video.js');
                  setTimeout(() => {
                    this.player?.pause();
                    console.log('Hero video paused after 5 seconds');
                  }, 5000);
                }).catch((err: Error) => {
                  console.log('Autoplay blocked:', err);
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
    
    console.log(`Screen dimensions: ${screenWidth}x${screenHeight}, DPR: ${window.devicePixelRatio}`);
    
    // Wähle Qualität basierend auf Viewport-Größe (nicht DPR, für besseres Testing)
    // Nutze die kleinere Dimension für die Entscheidung
    const relevantDimension = Math.min(screenHeight, screenWidth);
    
    if (screenHeight >= 1440 && screenWidth >= 2560) {
      console.log('Selected: 1080p (4K display)');
      return '1080p';  // 4K/Large displays
    } else if (screenHeight >= 1080 && screenWidth >= 1920) {
      console.log('Selected: 1080p (Full HD)');
      return '1080p';  // Full HD displays
    } else if (screenHeight >= 720 && screenWidth >= 1280) {
      console.log('Selected: 720p (HD)');
      return '720p';   // HD displays
    } else if (relevantDimension >= 360) {
      console.log('Selected: 360p (Small screen/mobile)');
      return '360p';   // Mobile/Tablet
    } else {
      console.log('Selected: 120p (Very small screen)');
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

  // Navigate to video player
  playVideo(video: Video) {
    this.router.navigate(['/video', video.id]);
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
