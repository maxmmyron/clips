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

interface TimelineLayerNode {
  uuid: string;
  metadata: TimelineNodeMetadata;
  next: TimelineLayerNode | null;
  prev: TimelineLayerNode | null;
}

interface TimelineNodeMetadata {
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
  selected: TimelineLayerNode[];
  head: TimelineLayerNode | null;
  curr: TimelineLayerNode | null;
  tail: TimelineLayerNode | null;
  videos: Map<string, HTMLVideoElement>;
  zoom: number;
  dragIndex: number;
}>;

type WritablePlayer = import("svelte/store").Writable<{
  playerState: "editor" | "preview";
  source: string | null;
  isPaused: boolean;
}>;

declare interface Window {
  mediaPool: UploadedMedia[];
}
