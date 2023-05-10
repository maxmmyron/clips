<script lang="ts">
  import { timeline } from "$lib/stores";
  import { onMount } from "svelte";

  export let metadata: TimelineMedia, audioContext: AudioContext, isPaused: boolean;

  let bufferEl: HTMLVideoElement;
  let currentTime: number;
  let audioNode: AudioBufferSourceNode;

  $: if (audioNode) isPaused && audioNode.disconnect();

  $: if (
    bufferEl &&
    bufferEl === $timeline.buffers[$timeline.currentBufferIndex].video &&
    currentTime >= bufferEl.duration - metadata.startTime - metadata.endTime
  ) {
    audioNode.disconnect();
    if ($timeline.currentBufferIndex === $timeline.buffers.length - 1) {
      isPaused = true;
    } else {
      $timeline.currentBufferIndex++;
    }
  }

  const handleBufferSetup = () => {
    currentTime = metadata.startTime;
  };

  const handlePlay = () => {
    console.log("playing source");
    audioNode = audioContext.createBufferSource();

    const audioNodeBuffer = audioContext.createBuffer(metadata.buffer.numberOfChannels, metadata.buffer.length, metadata.buffer.sampleRate);
    for (let i = 0; i < metadata.buffer.numberOfChannels; i++) audioNodeBuffer.copyToChannel(metadata.buffer.getChannelData(i), i);

    audioNode.buffer = audioNodeBuffer;

    const startOffset = metadata.startTime + (currentTime - metadata.startTime);
    const duration = metadata.duration - metadata.endTime - startOffset;

    audioNode.connect(audioContext.destination);
    audioNode.start(0, startOffset, duration);
  };

  onMount(() => {
    console.log("mounting video buffer");
    if (!bufferEl) throw new Error("No buffer");
    $timeline.buffers.push({
      video: bufferEl,
      metadata,
    });
  });
</script>

<video muted class="hidden" bind:currentTime src={metadata.src} bind:this={bufferEl} on:loadedmetadata={handleBufferSetup} on:play={handlePlay} />
