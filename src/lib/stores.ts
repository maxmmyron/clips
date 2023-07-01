import {spring} from "svelte/motion";
import { writable } from "svelte/store";
import TimelineLinkedList from "./components/timeline/TimelineLinkedList";

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
  clips: new TimelineLinkedList(),
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
export const buffers = writable(new Set<string>());
export const audioContext: App.stores.audioContext = writable();
export const toasts = writable(new Array<App.Toast>());

export const player: App.stores.player = writable({
  source: null,
  isPaused: true,
});
