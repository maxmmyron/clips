enum DropLocation { PLAYER, TIMELINE };

interface PreviewMedia {
  src: string;
}

interface UploadedMedia {
  /**
   * The name of the uploaded file. Used only for display purposes.
   */
  name: string;
  /**
   * The format of the uploaded file.
   */
  type: "video" | "image";
  /**
   * The original source of the uploaded file.
   */
  src: string;
  /**
   * The unique identifier of the media. this, plus the extension, can be used to reference the original uploaded media.
   */
  uuid: string;
  /**
   * The duration of the media, in seconds.
   */
  duration: number;
  thumbnails: string[];
  audio: AudioBuffer;
}

interface TimelineNode {
  uuid: string;
  metadata: TimelineNodeMetadata;
  next: TimelineNode | null;
  prev: TimelineNode | null;
}
interface TimelineNodeMetadata extends UploadedMedia {
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
  selected: string[];
  clips: import("./components/util/TimelineLinkedList").default
  curr: TimelineNode | null;
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
