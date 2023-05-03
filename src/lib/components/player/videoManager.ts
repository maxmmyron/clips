
export const generateTimelineAudioData = async (clips: TimelineMedia[]) => {
  // get all audio data and filter out any that failed to load
  let data = await Promise.allSettled(clips
    .map((clip) => clip.audioData))
    .then(results => (results.filter(result => result.status === "fulfilled") as PromiseFulfilledResult<Float32Array>[]).map(res => res.value));

  // return as a single Float32Array
  return data.reduce((acc, val) => {
    const tmp = new Float32Array(acc.length + val.length);
    tmp.set(acc, 0);
    tmp.set(val, acc.length);
    return tmp;
  }, new Float32Array(0));
}
