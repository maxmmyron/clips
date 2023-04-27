import {spring, type Spring} from "svelte/motion";
import { writable } from "svelte/store";

export const mediaDragProvider = writable({
  position: spring({x:0, y:0}),
  dragData: null,
  dropHandlers: new Map<DropLocation, () => void>(),
} as {
  position: Spring<{x:number,y:number}>
  dragData: string | null,
  dropHandlers: Map<DropLocation, () => void>;
})

export const studio = writable({
  resizeMode: null,
} as {
  resizeMode: "row" | "mediaCol" | "timelineCol" | null;
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
} as {
  selected: number[];
  clips: Omit<Media, "isSelected" > [];
});

