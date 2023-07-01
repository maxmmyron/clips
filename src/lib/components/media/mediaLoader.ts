import { get } from "svelte/store";
import { studio } from "../../stores";
import { v4 as uuidv4 } from "uuid";
import { addToast } from "$lib/util/toastManager";
import { parseMIME } from "./mimeParser";
import { assertBrowserSupportsContainer } from "./browserParser";
import { convertFileToSupportedContainer } from "$lib/util/FFmpegManager";

export const createMedia = async <T extends App.MediaTypes>(type: T, name: string, file: File): Promise<{uuid: string, media: App.MediaObjects<T>}> => {

  const MIME = await parseMIME(file);
  if (MIME === "file/unknown") {
    addToast("error", "Error loading media: MIME type could not be parsed.");
    throw Error("MIME type could not be parsed");
  }

  if (!(await assertBrowserSupportsContainer(MIME))) {
    src = await convertFileToSupportedContainer(file, MIME);
  } else src = URL.createObjectURL(file);

  const uuid: string = uuidv4();

  switch(type) {
    case "video":
      return {
        uuid,
        media: {
          uuid,
          type: "video",
          src: src,
          metadata: {
            duration: await loadMediaDuration(src, "video"),
            audio: await loadAudioBuffer(src),
            thumbnails: await loadThumbnails(src),
            title: name
          }
        }
      } as {uuid: string, media: App.MediaObjects<T>};

    case "audio":
      return {
        uuid,
        media: {
          uuid,
          type: "audio",
          src: src,
          metadata: {
            duration: await loadMediaDuration(src, "audio"),
            audio: await loadAudioBuffer(src),
            title: name
          }
        }
      } as {uuid: string, media: App.MediaObjects<T>};

    case "image":
      return {
        uuid,
        media: {
          uuid,
          type: "image",
          src: src,
          metadata: {
            title: name
          }
        }
      } as {uuid: string, media: App.MediaObjects<T>};

    default:
      addToast("error", `Error loading media: ${type} is not a valid media type.`);
      throw Error("Unsupported media type");

    };
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
