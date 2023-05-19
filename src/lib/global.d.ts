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
} & UploadedMedia;

type UploadedImage = {
  type: import("./exports").MediaType.IMAGE;
} & UploadedMedia;

interface TimelineLayerNode<T = TimelineVideo | TimelineAudio | TimelineImage> {
  uuid: string;
  metadata: T;
  next: TimelineLayerNode | null;
  prev: TimelineLayerNode | null;
}

interface TimelineMedia {
  src: string;
  name: string;
  duration: number;
  offsets: number[];
  /**
   * current runtime of the media
   */
  runtime: number;
  /**
   * The audioContext time when the media first began playing
   */
  initialTimestamp: number;
  /**
   * The total amount of time the media has been paused
   */
  pauseAccumulator: number;
  hasStarted: boolean;
  hasEnded: boolean;
  setMediaTime: (time: number) => void;
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
  selected: UploadedMedia<UploadedVideo | UploadedAudio | UploadedImage>[];
  media: UploadedMedia<UploadedVideo | UploadedAudio | UploadedImage>[];
}>;

type WritableTimeline = import("svelte/store").Writable<{
  selected: TimelineLayerNode<TimelineVideo | TimelineAudio | TimelineImage>[];
  clips: import("./components/util/TimelineLinkedList").default
  curr: TimelineLayerNode | null;
  buffers: Map<string, HTMLVideoElement | HTMLImageElement>;
  zoom: number;
  dragIndex: number;
}>;

type WritablePlayer = import("svelte/store").Writable<{
  playerState: "editor" | "preview";
  source: string | null;
  isPaused: boolean;
}>;

declare interface Window {
  mediaPool: UploadedMedia<UploadedVideo | UploadedAudio | UploadedImage>[];
}
