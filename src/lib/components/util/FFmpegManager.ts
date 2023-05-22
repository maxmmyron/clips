import { createFFmpeg } from '@ffmpeg/ffmpeg';

export const ffmpegInstance = createFFmpeg({log:true});

export const loadFFmpeg = async () => await ffmpegInstance.load();

