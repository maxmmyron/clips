import {spring, type Spring} from "svelte/motion";
import { writable } from "svelte/store";
import TimelineLinkedList from "./components/util/TimelineLinkedList";


export const studio = writable({
  resizeMode: null,
  audioContext: null,

  /**
   * The drag data. used to determine what media is being dragged, and how to transform it on the screen given certain drag actions.
   * If null, no dragging is occurring.
   */
  dragData: {
    media: null,
    originType: null,
    originPosition: null,
    dragEvent: null,
    ghost: {
      position: spring({x: 0, y: 0}),
      size: spring({width: 0, height: 0}),
    }
  },
  mouse: {x: 0, y: 0},
} as {
  resizeMode: "row" | "mediaCol" | "timelineCol" | null;
  audioContext: AudioContext | null;
  dragData: {
    media: UploadedMedia | null;
    originType: "mediaPool" | "timeline" | null;
    originPosition: {x:number, y:number} | null;
    dragEvent: "dragstart" | "drag" | "dragend" | null;
    currentDragRegion: "player" | "timeline" | null;
    ghost: {
      position: Spring<{x:number, y:number}>
      size: Spring<{width:number, height:number}>
    }
  }
  mouse: {x: number, y: number}
});

export const mediaPool: WritableMediaPool = writable({
  /**
   * An array of currently selected media indexes. Used to determine what media to display as selected in the media pool.
   */
  selected: [],
  /**
   * An array of loaded media. Carries a variety of information that can be used to display media details and preview media.
   */
  media: [],
});

export const timeline: WritableTimeline = writable({
  selected: [],
  clips: new TimelineLinkedList(),
  curr: null,
  videos: new Map(),
  zoom: 1,
  dragIndex: -1, // the index of the timeline node that is currently being dragged, or -1 if no node is being dragged
});

export const player: WritablePlayer = writable({
  playerState: "editor",
  source: null,
  isPaused: true,
});
