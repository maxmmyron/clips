import {spring, type Spring} from "svelte/motion";
import { writable } from "svelte/store";

export const studio = writable({
  /**
   * The current resize direction. Used to determine cursor stile and resize logic. If null, no resizing will occur.
   */
  resizeMode: null,
  /**
   * The drag data. used to determine what media is being dragged, and how to transform it on the screen given certain drag actions.
   * If null, no dragging is occurring.
   */
  dragData: null,
  /**
   * The current mouse position, represented as a spring.
   */
  mouse: spring({x:0, y:0}),
} as {
  resizeMode: "row" | "mediaCol" | "timelineCol" | null;
  dragData: StudioMediaMetadata | null;
  mouse: Spring<{x:number,y:number}>;
});

export const mediaPool: WritableMediaPool = writable({
  /**
   * The current preview media. Used to determine what media to display on the preview video element.
   * If null, no preview is being shown.
   */
  previewSrc: null,
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
  /**
   * An array of currently selected clip indexes. Used to determine what clips to display as selected in the timeline.
   */
  selected: [],
  /**
   * An array of loaded clips. Carries a variety of information that can be used to display clip details and preview clips.
   */
  clips: [],
});

