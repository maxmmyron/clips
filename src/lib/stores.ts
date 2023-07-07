import {spring} from "svelte/motion";
import { derived, writable } from "svelte/store";

export const studio = writable({
  mouse: { x: 0, y: 0 },
  name: "untitled",
});

export const draggable: App.stores.draggable = writable({
  media: null,
  event: null,
  origin: null,
  region: null,
  ghost: {
    pos: spring({ x: 0, y: 0 }),
    size: spring({ width: 0, height: 0 }),
  },
});

export const timeline: App.stores.timeline = writable({
  clips: { video: [], audio: [], },
  current: null,
  currentNodeRuntime: 0,
  duration: 0,
  runtime: 0,
  zoomScale: 5,
})

export const media: App.stores.media = writable({
  unresolved: [],
  resolved: [],
});
export const buffers = writable(new Map<string, { source: HTMLVideoElement | HTMLImageElement, type: Exclude<App.MediaTypes, "audio">}>());
export const audioContext: App.stores.audioContext = writable();
export const toasts = writable(new Array<App.Toast>());

export const player: App.stores.player = writable({
  source: null,
  isPaused: true,
});

export const secondWidth = derived(timeline, $timeline => 2 ** $timeline.zoomScale);
