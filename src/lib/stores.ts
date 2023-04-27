import {spring, type Spring} from "svelte/motion";
import { writable } from "svelte/store";

export const studio = writable({
  resizeMode: null,
  dragData: null,
  mouse: spring({x:0, y:0}),
} as {
  resizeMode: "row" | "mediaCol" | "timelineCol" | null;
  dragData: MediaDragData | null;
  mouse: Spring<{x:number,y:number}>;
});

export const media = writable({
  previewSource: "",
  selected: [],
  files: [],
} as {
  previewSource: string;
  selected: number[];
  files: MediaPoolFile[];
});

export const timeline = writable({
  selected: [],
  clips: [],
  thumbnails: new Map(),
} as {
  selected: number[];
  clips: Omit<Media, "isSelected" > [];
  thumbnails: Map<string, string>;
});

