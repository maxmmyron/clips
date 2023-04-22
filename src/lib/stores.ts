import { writable } from "svelte/store";

export const mediaStore = writable({
  previewIndex: null,
  media: [],
} as {
  previewIndex: number | null;
  media: MediaPoolElement[]
});
