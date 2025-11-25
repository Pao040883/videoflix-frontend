import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoService } from '../core/services/video.service';
import { VideoDetail } from '../core/models/video.model';
import { getMediaUrl } from '../core/utils/media-url.util';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss'
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private videoService = inject(VideoService);

  @ViewChild('videoPlayer') videoPlayerElement?: ElementRef<HTMLVideoElement>;
  
  private player?: Player;
  video?: VideoDetail;
  loading = true;
  error = false;
  currentQuality = '';
  availableQualities: string[] = [];
  showQualitySelector = false;
  toastMessage = '';
  showToast = false;

  ngOnInit(): void {
    // Get video ID from route
    const videoId = this.route.snapshot.paramMap.get('id');
    
    if (videoId) {
      this.loadVideo(+videoId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    // Cleanup Video.js player
    if (this.player) {
      this.player.dispose();
    }
  }

  private loadVideo(id: number): void {
    this.videoService.getVideo(id).subscribe({
      next: (video) => {
        this.video = video;
        this.loading = false;
        
        // Get available qualities from video_urls
        this.availableQualities = Object.keys(video.video_urls || {})
          .filter(q => q !== 'original')
          .sort((a, b) => {
            const order: { [key: string]: number } = { '1080p': 4, '720p': 3, '360p': 2, '120p': 1 };
            return (order[b] || 0) - (order[a] || 0);
          });
        
        // Wait for view to update
        setTimeout(() => {
          this.initializePlayer();
        }, 100);
      },
      error: (err) => {
        console.error('Error loading video:', err);
        this.error = true;
        this.loading = false;
      }
    });
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

  private initializePlayer(): void {
    if (!this.videoPlayerElement || !this.video) return;

    const videoElement = this.videoPlayerElement.nativeElement;
    
    // Get best quality based on screen resolution
    const bestQuality = this.getBestQualityForScreen();
    this.currentQuality = bestQuality;
    const videoUrl = this.video.video_urls[bestQuality] || this.video.video_urls['720p'] || this.video.video_urls['original'];
    const fullUrl = getMediaUrl(videoUrl);
    
    if (!fullUrl) {
      console.error('No video URL found');
      return;
    }

    console.log(`Selected quality: ${bestQuality} for screen height: ${window.innerHeight}px`);

    // Initialize Video.js
    this.player = videojs(videoElement, {
      controls: true,
      autoplay: true,
      preload: 'auto',
      fill: true,
      playbackRates: [0.5, 1, 1.5, 2],
      controlBar: {
        volumePanel: {
          inline: false
        }
      },
      sources: [{
        src: fullUrl,
        type: videoUrl?.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
      }]
    });

    // Player event listeners
    this.player.ready(() => {
      console.log('Player is ready');
    });

    this.player.on('error', () => {
      console.error('Video player error');
    });
  }

  goBack(): void {
    this.router.navigate(['/videoflix']);
  }

  toggleQualitySelector(): void {
    this.showQualitySelector = !this.showQualitySelector;
  }

  changeQuality(quality: string): void {
    if (!this.player || !this.video || quality === this.currentQuality) {
      this.showQualitySelector = false;
      return;
    }

    const currentTime = this.player.currentTime();
    const isPaused = this.player.paused();

    const videoUrl = this.video.video_urls[quality];
    if (!videoUrl) {
      console.error(`Quality ${quality} not available`);
      this.showQualitySelector = false;
      return;
    }

    const fullUrl = getMediaUrl(videoUrl);
    
    // Change video source
    this.player.src({
      src: fullUrl,
      type: videoUrl?.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
    });

    // Restore playback position
    this.player.currentTime(currentTime);
    
    if (!isPaused) {
      this.player.play();
    }

    this.currentQuality = quality;
    this.showQualitySelector = false;
    
    // Show toast notification
    this.showToastMessage(`Qualität geändert zu ${quality}`);
  }

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // Expose getMediaUrl to template if needed
  getMediaUrl = getMediaUrl;
}
