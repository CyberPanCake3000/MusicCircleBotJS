export interface YoutubeDLThumbnail {
  url: string;
  width: number;
  height: number;
  resolution?: string;
  id?: string;
}

export interface YoutubeDLResponse {
  id: string;
  title: string;
  thumbnails: YoutubeDLThumbnail[];
  description: string;
  duration: number;
  webpage_url: string;
  [key: string]: any;
}

export interface YTMusicTrack {
  title: string;
  thumbnails: YoutubeDLThumbnail[];
  videoId: string;
  startTime?: number;
  duration?: number;
}