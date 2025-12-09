import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, signal, computed, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoService } from '../core/services/video.service';
import { VideoDetail } from '../core/models/video.model';
import { getMediaUrl } from '../core/utils/media-url.util';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { registerTitleBar } from './videojs-title-bar';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss'
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private videoService = inject(VideoService);

  @ViewChild('videoPlayer') videoPlayerElement?: ElementRef<HTMLVideoElement>;
  
  private player?: Player;
  
  // Signals
  video = signal<VideoDetail | undefined>(undefined);
  loading = signal(true);
  error = signal(false);
  currentQuality = signal('');
  availableQualities = signal<string[]>([]);
  showQualitySelector = signal(false);
  toastMessage = signal('');
  showToast = signal(false);
  showOptimizingOverlay = signal(false);
  optimizingProgress = signal(0);
  private isFirstLoad = signal(true);

  ngOnInit(): void {
    // Get video ID from route
    const videoId = this.route.snapshot.paramMap.get('id');
    
    if (videoId) {
      this.loadVideo(+videoId);
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    // Cleanup Video.js player
    if (this.player) {
      this.player.dispose();
    }
  }

  private registerLineBreak(): void {
    const Component = videojs.getComponent('Component') as any;
    class LineBreak extends Component {
      constructor(player: Player, options?: any) {
        super(player, options);
        this['addClass']('vjs-line-break');
      }
    }
    videojs.registerComponent('LineBreak', LineBreak as any);
  }

  private loadVideo(id: number): void {
    this.videoService.getVideo(id).subscribe({
      next: (video) => {
        this.video.set(video);
        this.loading.set(false);
        
        // Get available qualities from video_urls
        this.availableQualities.set(
          Object.keys(video.video_urls || {})
            .filter(q => q !== 'original')
            .sort((a, b) => {
              const order: { [key: string]: number } = { '1080p': 4, '720p': 3, '360p': 2, '120p': 1 };
              return (order[b] || 0) - (order[a] || 0);
            })
        );
        
        // Wait for view to update
        setTimeout(() => {
          this.initializePlayer();
          
          // Show optimizing overlay on first load
          if (this.isFirstLoad()) {
            this.showOptimizingOverlay.set(true);
            this.simulateOptimizingProgress();
          }
        }, 100);
      },
      error: (err) => {
        console.error('Error loading video:', err);
        this.error.set(true);
        this.loading.set(false);
      }
    });
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

  private initializePlayer(): void {
    if (!this.videoPlayerElement || !this.video()) return;

    const videoElement = this.videoPlayerElement.nativeElement;
    const videoData = this.video()!;
    
    // Get best quality based on screen resolution
    const bestQuality = this.getBestQualityForScreen();
    this.currentQuality.set(bestQuality);
    const videoUrl = videoData.video_urls[bestQuality] || videoData.video_urls['720p'] || videoData.video_urls['original'];
    const fullUrl = getMediaUrl(videoUrl);
    
    if (!fullUrl) {
      console.error('No video URL found');
      return;
    }

    // Register custom components
    this.registerLineBreak();
    registerTitleBar();

    // Initialize Video.js
    this.player = videojs(videoElement, {
      controls: true,
      preload: 'auto',
      fill: true,
      playbackRates: [0.5, 1, 1.5, 2],
      controlBar: {
        children: [
          'progressControl',
          'remainingTimeDisplay',
          'lineBreak',
          'playToggle',
          'skipBackward',
          'skipForward',
          'volumePanel',
          'customControlSpacer',
          {
            name: 'TitleBar',
            title: videoData.title
          },
          'customControlSpacer',
          'playbackRateMenuButton',
          'fullscreenToggle'
        ],
        volumePanel: {
          inline: false
        },
        skipButtons: {
          forward: 10,
          backward: 10
        }
      },
      sources: [{
        src: fullUrl,
        type: videoUrl?.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
      }]
    });

    // Player event listeners
    this.player.ready(() => {
    });

    this.player.on('error', () => {
      console.error('Video player error');
    });
  }



  goBack(): void {
    this.router.navigate(['/videoflix']);
  }

  toggleQualitySelector(): void {
    this.showQualitySelector.update(value => !value);
  }

  changeQuality(quality: string): void {
    if (!this.player || !this.video() || quality === this.currentQuality()) {
      this.showQualitySelector.set(false);
      return;
    }

    const currentTime = this.player.currentTime();
    const isPaused = this.player.paused();

    const videoData = this.video()!;
    const videoUrl = videoData.video_urls[quality];
    if (!videoUrl) {
      console.error(`Quality ${quality} not available`);
      this.showQualitySelector.set(false);
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

    this.currentQuality.set(quality);
    this.showQualitySelector.set(false);
    
    // Show toast notification
    this.showToastMessage(`Qualität geändert zu ${quality}`);
  }

  private showToastMessage(message: string): void {
    this.toastMessage.set(message);
    this.showToast.set(true);
    
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  private simulateOptimizingProgress(): void {
    // Simulate progress from 0 to 100%
    const interval = setInterval(() => {
      this.optimizingProgress.update(progress => progress + 10);
      
      if (this.optimizingProgress() >= 100) {
        clearInterval(interval);
        // Hide overlay after a short delay
        setTimeout(() => {
          this.showOptimizingOverlay.set(false);
          this.isFirstLoad.set(false);
        }, 500);
      }
    }, 200); // Update every 200ms
  }

  // Expose getMediaUrl to template if needed
  getMediaUrl = getMediaUrl;

}
