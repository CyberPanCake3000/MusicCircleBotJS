import youtubeDl from 'youtube-dl-exec';
import { YTMusicTrack, YoutubeDLResponse } from '../types/ytMusic';
import { spawn } from 'child_process';
import { Readable } from 'stream';

export class YouTubeMusicService {
  async getTrack(url: string): Promise<YTMusicTrack> {
    try {
      const info = await youtubeDl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        callHome: true,
        noCheckCertificates: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true,
      }) as YoutubeDLResponse;

      return {
        title: info.title,
        thumbnails: info.thumbnails,
        videoId: info.id,
        startTime: this.extractStartTime(url)
      };
    } catch (error) {
      console.error('Error fetching track info:', error);
      throw new Error('Не удалось получить информацию о треке');
    }
  }

  async getAudioStream(videoId: string, startTime?: number): Promise<{ stdout: Readable; process: any }> {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const args = [
      url,
      '-f', 'bestaudio',
      '--rate-limit', '1M',
      '-o', '-'
    ];

    if (startTime) {
      args.push('--start', startTime.toString());
      console.log('start time: ', startTime.toString());
    }

    const process = spawn('yt-dlp', args);

    if (!process.stdout) {
      throw new Error('Failed to create audio stream');
    }

    // Handle potential errors
    process.stderr?.on('data', (data) => {
      console.error(`yt-dlp error: ${data}`);
    });

    process.on('error', (error) => {
      console.error('Failed to start yt-dlp process:', error);
    });

    return { stdout: process.stdout, process };
  }

  private extractStartTime(url: string): number | undefined {
    const timeRegex = /[?&]t=(\d+)/;
    const match = url.match(timeRegex);
    return match ? parseInt(match[1]) : undefined;
  }
}
