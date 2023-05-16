enum DropLocation { PLAYER, TIMELINE };

interface UploadedMedia {
  src: string;
  name: string;
}

type UploadedVideo = {
  type: import("./exports").MediaType.VIDEO;
  duration: number;
  thumbnails: string[];
  audio: AudioBuffer;
} & UploadedMedia;

type UploadedAudio = {
  type: import("./exports").MediaType.AUDIO;
  duration: number;
  audio: AudioBuffer;
  offsets: number[];
} & UploadedMedia;

type UploadedImage = {
  type: import("./exports").MediaType.IMAGE;
} & UploadedMedia;

interface TimelineLayerNode {
  uuid: string;
  metadata: TimelineVideo | TimelineAudio | TimelineImage;
  next: TimelineLayerNode | null;
  prev: TimelineLayerNode | null;
}

interface TimelineMedia {
  uuid: string;
  src: string;
  name: string;
  duration: number;
  offsets: number[];
  hasStarted: boolean;
  hasEnded: boolean;
}

type TimelineVideo = {
  type: import("./exports").MediaType.VIDEO;
  thumbnails: string[];
  audio: AudioBuffer;
} & TimelineMedia;

type TimelineAudio = {
  type: import("./exports").MediaType.AUDIO;
  audio: AudioBuffer;
} & TimelineMedia;

type TimelineImage = {
  type: import("./exports").MediaType.IMAGE;
} & TimelineMedia;

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
