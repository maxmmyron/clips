enum DropLocation { PLAYER, TIMELINE };

interface StudioMediaMetadata {
  /**
   * The media source URL.
   */
  src: string;
  /**
   * The name of the file. Used as an identifier for the media, and as the display name in the media pool.
   */
  name: string;
  /**
   * The media duration in seconds. Used to determine the length of the clip in the timeline.
   */
  duration: Promise<number>;
  /**
   *  A series of base64 encoded images to use as thumbnails.
   */
  thumbnails: Promise<string[]>;
  /**
   * The audio buffer source node. Used to play the audio and generate a timeline waveform preview.
   */
  audioBufferSourceNode: Promise<AudioBufferSourceNode>;
  /**
   * The start time of the clip in seconds. This goes unused in the media pool, and is used to clip media in the timeline.
   */
  startTime: number;
  /**
   * The end time of the clip in seconds. This goes unused in the media pool, and is used to clip media in the timeline.
   */
  endTime: number;
}

type WritableMediaPool = import("svelte/store").Writable<{
  previewSrc: StudioMediaMetadata | null;
  selected: StudioMediaMetadata[];
  media: StudioMediaMetadata[];
}>;

type WritableTimeline = import("svelte/store").Writable<{
  selected: StudioMediaMetadata[];
  clips: StudioMediaMetadata[];
}>;
