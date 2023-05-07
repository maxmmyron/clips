import { get } from "svelte/store";
import { studio } from "./stores";

export const loadMediaMetadata = async (file: File) => {
  const src = URL.createObjectURL(file);

  if(file.type === "video/quicktime") {
    // TODO: relay warning to kitty
    console.warn("Quicktime videos are not supported. Please convert to a different format.")
    return null;
  }

  return {
    src,
    name: file.name,
    duration: await loadMediaDuration(src),
    thumbnails: await loadThumbnails(src),
    buffer: await loadAudioBuffer(src),
  } as UploadedMedia;
};

export const loadMediaDuration = (src: string) => new Promise<number>((resolve, reject) => {
  const video = document.createElement("video");
  video.src = src;
  video.preload = "metadata";
  video.load();
  video.addEventListener("loadedmetadata", () => {
    resolve(video.duration);
  });
});

/**
 * Parses a media source and returns a series of thumbnails to use as a preview.
 * TODO: implement zoomScale as factor in determining how many thumbnails to generate.
 */
export const loadThumbnails = (src: string) => new Promise<string[]>(async (resolve, reject) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const duration = await loadMediaDuration(src);

  const video = document.createElement("video");
  video.src = src;

  let thumbnails: string[] = [];

  video.load();

  video.addEventListener("loadeddata", () => {
    const aspectRatio = video.videoWidth / video.videoHeight;
    canvas.width = 480;
    canvas.height = 480 / aspectRatio;

    if (!context) {
      reject("Could not create canvas context");
      return;
    }

    // one thumbnail every 5 seconds
    for (let i = 0; i < duration; i+=5) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      thumbnails.push(canvas.toDataURL());
      video.currentTime += 5;
    }

    resolve(thumbnails);
  });
});

export const loadAudioBuffer = async (src: string) => new Promise<AudioBuffer>((resolve, reject) => {
  const audioContext = get(studio).audioContext;
  if(!audioContext) reject("No audio context");
  else fetch(src).then(res => res.arrayBuffer())
  .then(buffer => audioContext.decodeAudioData(buffer)
    .then(buffer => resolve(buffer))
    .catch(err => reject(`Error decoding audio data: ${err}`)))
  .catch(err => reject(`Error fetching audio data: ${err}`));
});
