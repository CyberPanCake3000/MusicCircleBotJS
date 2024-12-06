import sharp from 'sharp';
import axios from 'axios';

export class ImageProcessor {
  static async createCircularImage(imageUrl: string, size: number): Promise<Buffer> {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    const circle = Buffer.from(
      `<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" /></svg>`
    );

    return sharp(imageBuffer)
      .resize(size, size)
      .composite([{
        input: circle,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
  }

  static async rotateImage(imageBuffer: Buffer, angle: number): Promise<Buffer> {
    return sharp(imageBuffer)
      .rotate(angle)
      .toBuffer();
  }
}