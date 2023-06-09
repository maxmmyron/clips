import {spring} from "svelte/motion";
import { writable } from "svelte/store";
import TimelineLinkedList from "./components/timeline/TimelineLinkedList";

export const studio: App.stores.WritableStudio = writable({
  resize: null,
  audioContext: null,
  mouse: { x: 0, y: 0 },
  exportName: "untitled",
  /**
   * The drag data. used to determine what media is being dragged, and how to transform it on the screen given certain drag actions.
   * If null, no dragging is occurring.
   */
  draggable: {
    mediaUUID: null,
    origin: null,
    event: null,
    current: {
      region: null,
    },
    ghost: {
      pos: spring({x: 0, y: 0}),
      size: spring({width: 0, height: 0}),
    }
  },
});

export const toasts = writable(new Array<App.Toast>());

export const mediaPool: App.stores.WritableMediaPool = writable({
  /**
   * An array of currently selected media uuids.
   */
  selected: new Array<string>(),
  /**
   * An array of loaded media. Carries a variety of information that can be used to display media details and preview media.
   */
  media: new Array<App.Media>(),
});

export const timeline: App.stores.WritableTimeline = writable({
  selected: new Array<string>(),
  timeline: new TimelineLinkedList(),
  current: null,
  sources: new Map(),
  zoomScale: 5,
  dragIndex: -1,
  runtime: 0,
  duration: 0,
  currentNodeRuntime: 0,
});

export const player: App.stores.WritablePlayer = writable({
  source: null,
  isSinglePreview: false,
  isPaused: true,
  lastPauseState: true,
});
