import { writable } from "svelte/store";

export const mediaStore = writable({
  isAnySelected: false,
  previewIndex: null,
  media: [],
} as {
  isAnySelected: boolean;
  previewIndex: number | null;
  media: MediaPoolElement[]
});
