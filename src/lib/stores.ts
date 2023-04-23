import { writable } from "svelte/store";

export const media = writable({
  previewSource: "",
  selected: [],
  files: [],
} as {
  previewSource: string;
  selected: number[];
  files: Pick<Media, "src" | "isSelected">[];
});

export const timeline = writable({
  selected: [],
  clips: [],
} as {
  selected: number[];
  clips: Omit<Media, "isSelected" > [];
});

