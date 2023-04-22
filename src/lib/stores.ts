import { writable } from "svelte/store";

export const media = writable({
  isAnySelected: false,
  previewIndex: null,
  files: [],
} as {
  isAnySelected: boolean;
  previewIndex: number | null;
  files: Omit<Media, "startOffset" | "endOffset">[];
});

export const timeline = writable<Omit<Media, "isSelected">[]>([]);

