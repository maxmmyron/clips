enum DropLocation { PLAYER, TIMELINE };

interface PreviewMedia {
  src: string;
}

interface UploadedMedia {
  src: string;
  name: string;
  duration: number;
  thumbnails: string[];
  audio: AudioBuffer;
}

interface TimelineMedia {
  uuid: string;
  duration: number;
  name: string;
  src: string;
  audio: AudioBuffer;
  startOffset: number;
  endOffset: number;
  thumbnails: string[];
}

type WritableMediaPool = import("svelte/store").Writable<{
  selected: UploadedMedia[];
  media: UploadedMedia[];
}>;

type WritableTimeline = import("svelte/store").Writable<{
  selected: TimelineMedia[];
  clips: TimelineMedia[];
  videos: Map<string, HTMLVideoElement>;
  zoom: number;
  dragIndex: number;
  clipIndex: number;
}>;

type WritablePlayer = import("svelte/store").Writable<{
  playerState: "editor" | "preview";
  source: string | null;
  isPaused: boolean;
}>;

declare interface Window {
  mediaPool: UploadedMedia[];
}
