enum DropLocation { PLAYER, TIMELINE };

interface VideoMetadata extends MediaPoolMetadata {
  duration: number;
  thumbnails: string[];
  audio: AudioBuffer;
};

interface AudioMetadata extends MediaPoolMetadata {
  duration: number;
  audio: AudioBuffer
}

// TODO: flesh out image metadata (if necessary)
interface ImageMetadata extends MediaPoolMetadata {}

interface UploadedMedia<T extends MediaPoolMetadata> {
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

interface VideoTimelineMetadata extends TimelineMetadata {
  audio: AudioBuffer;
  thumbnails: string[];
}

interface AudioTimelineMetadata extends TimelineMetadata {
  audio: AudioBuffer;
}

interface ImageTimelineMetadata extends TimelineMetadata {}

interface TimelineNodeMetadata<T extends TimelineMetadata>  {
  src: string;
  name: string;
  duration: number;
  payload: T;
  startOffset: number;
  endOffset: number;
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
