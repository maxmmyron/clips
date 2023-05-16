enum MediaType { VIDEO, AUDIO, IMAGE };
enum DropLocation { PLAYER, TIMELINE };

interface UploadedMedia {
  src: string;
  name: string;
}

type UploadedVideo = {
  type: MediaType.VIDEO;
  duration: number;
  thumbnails: string[];
  audio: AudioBuffer;
} & UploadedMedia;

type UploadedAudio = {
  type: MediaType.AUDIO;
  duration: number;
  audio: AudioBuffer;
} & UploadedMedia;

type UploadedImage = {
  type: MediaType.IMAGE;
} & UploadedMedia;

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
  selected: UploadedMedia<VideoMetadata | AudioMetadata | ImageMetadata>[];
  media: UploadedMedia<VideoMetadata | AudioMetadata | ImageMetadata>[];
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
  mediaPool: UploadedMedia<VideoMetadata | AudioMetadata | ImageMetadata>[];
}
