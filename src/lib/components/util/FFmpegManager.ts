import { createFFmpeg } from '@ffmpeg/ffmpeg';

export const FFmpeg = createFFmpeg({log:true});

export const loadFFmpeg = async () => await FFmpeg.load();

