enum DropLocation { PLAYER, TIMELINE };

type AudioMetadata = {
  duration: number;
  audio: AudioBuffer
}

// TODO: flesh out image metadata (if necessary)
type ImageMetadata = {
  width: number;
  height: number;
}

type VideoMetadata = {
  duration: number;
  thumbnails: string[];
  audio: AudioBuffer;
};

interface UploadedMedia<T> {
  src: string;
  name: string;
  metadata: T;
}

interface TimelineLayerNode {
  uuid: string;
  metadata: TimelineNodeMetadata;
  next: TimelineLayerNode | null;
  prev: TimelineLayerNode | null;
}
interface TimelineNodeMetadata  {
  duration: number;
  name: string;
  src: string;
  audio: AudioBuffer;
  startOffset: number;
  endOffset: number;
  thumbnails: string[];
  hasStarted: boolean;
  hasEnded: boolean;
}

type WritableMediaPool = import("svelte/store").Writable<{
  selected: UploadedMedia[];
  media: UploadedMedia[];
}>;

type WritableTimeline = import("svelte/store").Writable<{
  selected: TimelineLayerNode[];
  clips: import("./components/util/TimelineLinkedList").default
  curr: TimelineLayerNode | null;
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
