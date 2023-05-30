import { createFFmpeg } from '@ffmpeg/ffmpeg';

export const ffmpegInstance = createFFmpeg({ log: true });

export const loadFFmpeg = async () => {
  if (!ffmpegInstance.isLoaded()) await ffmpegInstance.load();
  else console.warn("FFmpeg already loaded");
};
