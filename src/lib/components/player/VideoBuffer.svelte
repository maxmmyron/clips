<script lang="ts">
  import { timeline } from "$lib/stores";
  import { onMount } from "svelte";

  export let metadata: TimelineMedia, audioContext: AudioContext, isPaused: boolean;

  let buffer: HTMLVideoElement | undefined;
  let currentTime: number;
  let audioNode: AudioBufferSourceNode;

  $: if (audioNode) isPaused ? audioNode.disconnect() : audioNode.connect(audioContext.destination);

  $: if (buffer && currentTime >= buffer.duration - metadata.startTime - metadata.endTime) {
    audioNode.disconnect();
    if ($timeline.currentBufferIndex === $timeline.buffers.length - 1) {
      audioContext && audioContext.suspend();
      isPaused = true;
    } else {
      $timeline.currentBufferIndex++;
    }
  }

  const handleBufferSetup = () => {
    currentTime = metadata.startTime;
  };

  const handlePlay = () => {
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
    if (!buffer) throw new Error("No buffer");
    $timeline.buffers.push(buffer);
  });
</script>

<video muted class="hidden" bind:currentTime src={metadata.src} bind:this={buffer} on:loadedmetadata={handleBufferSetup} on:play={handlePlay} />
