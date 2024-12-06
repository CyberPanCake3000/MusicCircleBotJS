import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import axios from 'axios';
import { ImageProcessor } from './imageProcessor';
import sharp from 'sharp';

const streamPipeline = promisify(pipeline);

export class VideoProcessor {
  private readonly FPS = 30;
  private readonly DURATION = 20;
  private readonly OUTPUT_SIZE = 480;

  async createVideoNoteFromStream(imageBuffer: Buffer, audioStream: any): Promise<string> {
    const tempDir = 'temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const framePath = path.join(tempDir, 'frame.png');
    await sharp(imageBuffer).toFile(framePath);

    const audioPath = path.join(tempDir, 'preview.mp3');
    const outputPath = path.join(tempDir, 'output.mp4');

    await new Promise<void>((resolve, reject) => {
      audioStream.stdout.pipe(fs.createWriteStream(audioPath))
        .on('finish', () => resolve())
        .on('error', (error: Error) => reject(error));
    });

    await this.createStaticVideo(framePath, audioPath, outputPath);

    fs.unlinkSync(framePath);
    fs.unlinkSync(audioPath);

    return outputPath;
  }

  private createStaticVideo(framePath: string, audioPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(framePath)
        .inputOptions(['-loop 1'])
        .input(audioPath)
        .outputOptions([
          '-c:v libx264',
          '-crf 23',
          '-preset faster',
          '-c:a aac',
          '-b:v 800k',
          '-pix_fmt yuv420p',
          `-t ${this.DURATION}`
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .run();
    });
  }
}