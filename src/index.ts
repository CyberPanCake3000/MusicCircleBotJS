import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { ImageProcessor } from './services/imageProcessor';
import { VideoProcessor } from './services/videoProcessor';
import { YouTubeMusicService } from './services/ytMusic';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const youtubeMusicService = new YouTubeMusicService();

const videoProcessor = new VideoProcessor();

bot.command('start', (ctx) => {
  ctx.reply('Привет! Я могу сделать тебе кружочек, нужно лишь отправить ссылку на трек со Spotify');
});

bot.on(message('text'), async (ctx) => {
  const url = ctx.message.text;

  try {
    const track = await youtubeMusicService.getTrack(url);
    if (!track.thumbnails.length) {
      ctx.reply('У этого трека нет обложки');
      return;
    }

    await ctx.reply('Генерирую твой кружочек...');
    const circularImage = await ImageProcessor.createCircularImage(
      track.thumbnails[track.thumbnails.length - 1].url,
      480
    );

    const audioProcess = await youtubeMusicService.getAudioStream(track.videoId, track.startTime);
    const outputPath = await videoProcessor.createVideoNoteFromStream(
      circularImage,
      audioProcess
    );

    await ctx.replyWithVideoNote({ source: outputPath });
    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error(error);
    ctx.reply(`Возникла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
});

bot.launch().then(() => {
  console.log('Bot is running');
}).catch(console.error);

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));