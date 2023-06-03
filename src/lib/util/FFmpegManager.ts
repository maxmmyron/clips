import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

export const ffmpegInstance = createFFmpeg({ log: true });

export const loadFFmpeg = async () => {
  if (!ffmpegInstance.isLoaded()) await ffmpegInstance.load();
  else console.warn("FFmpeg already loaded");
};

export const convertFileToSupportedContainer = async (file: File, mime: string) => {
  const mimeType = mime.split("/")[0], conversionExt = mimeType === "video" ? "mp4" : mimeType === "audio" ? "mp3" : "jpg";

  ffmpegInstance.FS("writeFile", file.name, await fetchFile(file));
  ffmpegInstance.FS("writeFile", `ffmpeg.${conversionExt}`, "");
  await ffmpegInstance.run("-i", file.name, "-codec", "copy", `ffmpeg.${conversionExt}`);

  const data = ffmpegInstance.FS("readFile", `ffmpeg.${conversionExt}`);
  const blob = new Blob([data.buffer], { type: `${mimeType}/${conversionExt}` });

  ffmpegInstance.FS("unlink", file.name);
  ffmpegInstance.FS("unlink", `ffmpeg.${conversionExt}`);

  return URL.createObjectURL(blob);
}
