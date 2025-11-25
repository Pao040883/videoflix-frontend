export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface VideoFile {
  id: number;
  resolution: 'original' | '1080p' | '720p' | '360p' | '120p';
  file: string;
  file_size: number | null;
  width: number | null;
  height: number | null;
  bitrate: number | null;
  is_processed: boolean;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  genre: Genre;
  duration: number | null;
  release_year: number | null;
  thumbnail: string | null;
  preview_image: string | null;
  is_featured: boolean;
  available_resolutions: string[];
  created_at: string;
}

export interface VideoDetail extends Video {
  video_urls: Record<string, string>;
  video_files: VideoFile[];
  updated_at: string;
}

export interface VideosByGenre {
  [genreName: string]: {
    genre_id: number;
    genre_slug: string;
    videos: Video[];
  };
}
