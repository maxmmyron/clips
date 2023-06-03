import { get } from "svelte/store";
import { studio } from "../stores";
import { v4 as uuidv4 } from "uuid";

export const parseMediaMetadata = async (file: File, src: string): Promise<App.VideoMedia | App.AudioMedia | App.ImageMedia> => {
  const defaultMediaProperties = {
    uuid: uuidv4(),
    src,
    name: file.name,
  };

  if(file.type.includes("audio")) {
    return {
      ...defaultMediaProperties,
      type: "audio",
      metadata: {
        audio: await loadAudioBuffer(src),
        duration: await loadMediaDuration(src, "audio"),
        title: file.name,
      }
    } as App.AudioMedia;
  } else if(file.type.includes("video")) {
    return {
      ...defaultMediaProperties,
      type: "video",
      metadata: {
        duration: await loadMediaDuration(src, "video"),
        thumbnails: await loadThumbnails(src),
        audio: await loadAudioBuffer(src),
        title: file.name,
      }
    } as App.VideoMedia;
  } else if(file.type.includes("image")) {
    return {
      ...defaultMediaProperties,
      type: "image",
      metadata: {
        title: file.name,
      },
    } as App.ImageMedia;
  } else throw Error("Unsupported file type");
};

const loadMediaDuration = (src: string, type: string) => new Promise<number>((resolve, reject) => {
  if(type === "audio") {
    const audio = document.createElement("audio");
    audio.src = src;
    audio.preload = "metadata";
    audio.load();

    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration);
    });
  }
  else if(type === "video") {
    const video = document.createElement("video");
    video.src = src;
    video.preload = "metadata";
    video.load();

    video.addEventListener("loadedmetadata", () => {
      resolve(video.duration);
    });
  }
  else reject("Unsupported media type");
});

/**
 * Parses a media source and returns a series of thumbnails to use as a preview.
 * TODO: implement zoomScale as factor in determining how many thumbnails to generate.
 */
const loadThumbnails = (src: string) => new Promise<string[]>(async (resolve, reject) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const duration = await loadMediaDuration(src, "video");

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
    for (let i = 0; i < duration; i += 5) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      thumbnails.push(canvas.toDataURL());
      video.currentTime += 5;
    }

    resolve(thumbnails);
  });
});

const loadAudioBuffer = async (src: string) => new Promise<AudioBuffer>((resolve, reject) => {
  const audioContext = get(studio).audioContext;
  if (!audioContext) reject("No audio context");
  else fetch(src).then(res => res.arrayBuffer())
    .then(buffer => {
      audioContext.decodeAudioData(buffer)
        .then(buffer => resolve(buffer))
        .catch(err => reject(`Error decoding audio data: ${err}`));
    })
    .catch(err => reject(`Error fetching audio data: ${err}`));
});
