import { writable } from "svelte/store";

export const media = writable({
  isAnySelected: false,
  previewIndex: null,
  files: [],
} as {
  isAnySelected: boolean;
  previewIndex: number | null;
  files: MediaPoolElement[]
});

export const timeline = writable<TimelineElement[]>([]);

