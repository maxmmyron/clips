import { get } from "svelte/store";
import { audioContext } from "../../stores";
import { v4 as uuidv4 } from "uuid";
import { parseMIME } from "./mimeParser";
import { assertBrowserSupportsContainer } from "./browserParser";
import { convertFileToSupportedContainer } from "$lib/util/FFmpegManager";

export const createMedia = async <T extends App.MediaTypes>(type: T, name: string, file: File): Promise<{uuid: string, media: Promise<App.MediaObjects<T>>}> => {
  console.log(`loading ${name} as ${type}...`);

  const MIME = await parseMIME(file);
  console.log(`${name} MIME: ${MIME}`);
  if (MIME === "file/unknown") throw new Error("MIME type could not be parsed.");

  let src: string = "";
  if (!(await assertBrowserSupportsContainer(MIME))) {
    console.log(`${MIME} type isn't natively supported... converting ${name}`)
    src = await convertFileToSupportedContainer(file, MIME);
  } else src = URL.createObjectURL(file);

  console.log(`${name} src: ${src}`);

  const uuid: string = uuidv4();

  switch(type) {
    case "video":
      return {
        uuid,
        media: new Promise(async (resolve, reject) => {
          let duration = await loadMediaDuration(src, "video").catch(e => reject(e));
          let audio = await loadAudioBuffer(src).catch(e => reject(e));
          let thumbnails = await loadThumbnails(src).catch(e => reject(e))

          resolve({
            uuid,
            type: "video",
            src: src,
            metadata: {
              duration,
              audio,
              thumbnails,
              title: name
            }
          } as App.MediaObjects<T>);
        })
      }

    case "audio":
      return {
        uuid,
        media: new Promise(async (resolve, reject) => {
          let duration = await loadMediaDuration(src, "video").catch(e => reject(e));
          let audio = await loadAudioBuffer(src).catch(e => reject(e));

          resolve({
            uuid,
            type: "audio",
            src: src,
            metadata: {
              duration,
              audio,
              title: name
            }
          } as App.MediaObjects<T>);
        })
      }

    case "image":
      return {
        uuid,
        media: new Promise(async (resolve, reject) => {
          resolve({
            uuid,
            type: "image",
            src: src,
            metadata: {
              title: name
            }
          } as App.MediaObjects<T>);
        })
      }

    default:
      throw new Error("Unsupported media type.");
    };
};

const loadMediaDuration = (src: string, type: string) => new Promise<number>((resolve, reject) => {
  console.log("loading media duration...")

  if(type === "audio") {
    const audio = document.createElement("audio");
    audio.src = src;
    audio.preload = "metadata";
    audio.load();

    audio.addEventListener("loadedmetadata", () => {
      console.log("finished loading media duration");
      resolve(audio.duration);
    });
  }
  else if(type === "video") {
    const video = document.createElement("video");
    video.src = src;
    video.preload = "metadata";
    video.load();

    video.addEventListener("loadedmetadata", () => {
      console.log("finished loading media duration");
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
  console.log("loading thumbnails...");
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

    console.log("finished loading thumbanils")
    resolve(thumbnails);
  });
});

const loadAudioBuffer = async (src: string) => new Promise<AudioBuffer>((resolve, reject) => {
  console.log("loading audio buffer...")
  const aCtx = get(audioContext);
  if (!aCtx) reject("No audio context");
  else fetch(src).then(res => res.arrayBuffer())
    .then(buffer => {
      console.log(`buffer: ${buffer}`)
      aCtx.decodeAudioData(buffer)
        .then(buffer => {
          console.log("finished loading audio buffer.");
          resolve(buffer)
        })
        .catch(err => reject(`Error decoding audio data: ${err}`));
    })
    .catch(err => reject(`Error fetching audio data: ${err}`));
});
