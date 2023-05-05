import { timeline } from "$lib/stores"

let clips: TimelineMedia[] = [];
timeline.subscribe(timeline => timeline.clips);

export const regenerateEditorAudio = (audioContext: AudioContext) => {
  audioContext.close();
  const maxSampleRate = clips.reduce((max, clip) => clip.audioData.sampleRate > max ? clip.audioData.sampleRate : max, 0);
  const totalDuration = clips.reduce((total, clip) => total + clip.duration - clip.startTime - clip.endTime, 0);

  const audioBuffer = audioContext.createBuffer(1, totalDuration * maxSampleRate, maxSampleRate);
  const gainNode = audioContext.createGain();

  let offset = 0;
  for(let i = 0; i < clips.length; i++) {
    const audio = clips[i].audioData;
    const duration = clips[i].duration - clips[i].endTime - clips[i].startTime;

    audioBuffer.copyToChannel(audio.buffer, 0, offset);
    offset += duration * audio.sampleRate;
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
}
