enum DropLocation { PLAYER, TIMELINE };

interface PreviewMedia {
  src: string;
}

interface MediaAudioData {
  buffer: Float32Array;
  sampleRate: number;
}

interface UploadedMedia {
  src: string;
  name: string;
  duration: number;
  thumbnails: string[];
  audioData: MediaAudioData;
}

interface TimelineMedia {
  uuid: string;
  src: string;
  name: string;
  duration: number;
  thumbnails: string[];
  audioData: MediaAudioData;
  startTime: number;
  endTime: number;
}

type WritableMediaPool = import("svelte/store").Writable<{
  selected: UploadedMedia[];
  media: UploadedMedia[];
}>;

type WritableTimeline = import("svelte/store").Writable<{
  selected: TimelineMedia[];
  clips: TimelineMedia[];
  zoomScale: number;
  dragIndex: number;
}>;

type WritablePlayer = import("svelte/store").Writable<{
  playerState: "editor" | "preview";
  source: string | null;
}>;

declare interface Window {
  mediaPool: UploadedMedia[];
}
