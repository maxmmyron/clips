// interface UploadedMedia {
//   src: string;
//   name: string;
// }

// type UploadedVideo = {
//   type: "video";
//   duration: number;
//   thumbnails: string[];
//   audio: AudioBuffer;
// } & UploadedMedia;

// type UploadedAudio = {
//   type: "audio";
//   duration: number;
//   audio: AudioBuffer;
// } & UploadedMedia;

// type UploadedImage = {
//   type: "image";
// } & UploadedMedia;

// interface TimelineMedia {
//   src: string;
//   name: string;
//   duration: number;
//   offsets: number[];
//   /**
//    * current runtime of the media
//    */
//   runtime: number;
//   /**
//    * The audioContext time when the media first began playing
//    */
//   initialTimestamp: number;
//   /**
//    * The total amount of time the media has been paused
//    */
//   pauseAccumulator: number;
//   hasStarted: boolean;
//   hasEnded: boolean;
//   setMediaTime: (time: number) => void;
// }

// type TimelineVideo = {
//   type: "video";
//   thumbnails: string[];
//   audio: AudioBuffer;
// } & TimelineMedia;

// type TimelineAudio = {
//   type: "audio";
//   audio: AudioBuffer;
// } & TimelineMedia;

// type TimelineImage = {
//   type: "image";
// } & TimelineMedia;

// type WritableMediaPool = import("svelte/store").Writable<{
//   selected: UploadedMedia<UploadedVideo | UploadedAudio | UploadedImage>[];
//   media: UploadedMedia<UploadedVideo | UploadedAudio | UploadedImage>[];
// }>;

// type WritableTimeline = import("svelte/store").Writable<{
//   selected: TimelineLayerNode<TimelineVideo | TimelineAudio | TimelineImage>[];
//   clips: import("./components/util/TimelineLinkedList").default
//   curr: TimelineLayerNode | null;
//   buffers: Map<string, HTMLVideoElement | HTMLImageElement>;
//   zoom: number;
//   dragIndex: number; FIXME: remove
// }>;

// type WritablePlayer = import("svelte/store").Writable<{
//   playerState: "editor" | "preview";
//   source: string | null;
//   isPaused: boolean;
// }>;
