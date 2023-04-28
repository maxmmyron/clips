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
}

interface startTimeMetadata {
  /**
   * The start time of the clip in seconds.
   */
  startTime: number;
  /**
   * The end time of the clip in seconds.
   */
  endTime: number;
}

type StudioTimelineMetadata = StudioMediaMetadata & startTimeMetadata;
