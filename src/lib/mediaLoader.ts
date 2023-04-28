export const loadMediaDuration = async (src: string) => {
  const video = document.createElement("video");
  video.src = src;
  video.preload = "metadata";
  await video.load();
  return video.duration;
};

/**
 * Parses a media source and returns a series of thumbnails to use as a preview.
 * TODO: implement zoomScale as factor in determining how many thumbnails to generate.
 */
export const loadThumbnails = async (src: string) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const duration = await loadMediaDuration(src);

  const video = document.createElement("video");
  video.src = src;

  const thumbnails = [];

  await video.load();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  if(!context) throw new ReferenceError("Could not get canvas context.");

  // one thumbnail every 5 seconds
  for (let i = 0; i < duration / 5; i++) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    thumbnails.push(canvas.toDataURL());
  }

  return thumbnails;
};

export const loadAudioBufferSourceNode = async (src: string) => new Promise<AudioBufferSourceNode>((resolve, reject) => {
  const audioContext = new AudioContext();
  fetch(src).then(res => res.arrayBuffer().then(buffer => audioContext.decodeAudioData(buffer, (buffer: AudioBuffer) => {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    resolve(source);
  })));
});
