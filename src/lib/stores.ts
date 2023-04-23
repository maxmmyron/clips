import { writable } from "svelte/store";

export const media = writable({
  isAnySelected: false,
  previewIndex: null,
  files: [],
} as {
  isAnySelected: boolean;
  previewIndex: number | null;
  files: Pick<Media, "src" | "isSelected">[];
});

export const timeline = writable({
  selectedIndex: null,
  clips: [],
} as {
  selectedIndex: number | null;
  clips: Omit<Media, "isSelected" > []
});

