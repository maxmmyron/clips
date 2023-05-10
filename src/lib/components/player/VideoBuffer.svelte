<script lang="ts">
  import { timeline, player } from "$lib/stores";
  import { onMount } from "svelte";

  export let metadata: TimelineMedia, audioContext: AudioContext;

  let video: HTMLVideoElement;
  let currentTime: number;
  let audioNode: AudioBufferSourceNode;

  $: if (audioNode) $player.isPaused && audioNode.disconnect();

  $: if (
    video &&
    video === $timeline.videos.get($timeline.clips[$timeline.clipIndex].uuid) &&
    currentTime >= video.duration - metadata.startOffset - metadata.endOffset
  ) {
    if (audioNode) audioNode.disconnect();

    if ($timeline.clipIndex === $timeline.clips.length - 1) {
      $player.isPaused = true;
    } else {
      $timeline.clipIndex++;
    }
  }

  const handleBufferSetup = () => {
    currentTime = metadata.startOffset;
  };

  const handlePlay = () => {
    console.log("playing source");
    audioNode = audioContext.createBufferSource();

    const startOffset = Math.max(metadata.startOffset, metadata.startOffset + (currentTime - metadata.startOffset));

    video.currentTime = startOffset;

    const audioNodeBuffer = audioContext.createBuffer(metadata.audio.numberOfChannels, metadata.audio.length, metadata.audio.sampleRate);
    for (let i = 0; i < metadata.audio.numberOfChannels; i++) audioNodeBuffer.copyToChannel(metadata.audio.getChannelData(i), i);

    audioNode.buffer = audioNodeBuffer;

    const duration = metadata.duration - metadata.endOffset - startOffset;

    audioNode.connect(audioContext.destination);
    audioNode.start(0, startOffset, duration);
  };

  onMount(() => {
    console.log("mounting video buffer");
    if (!video) throw new Error("No buffer");
    $timeline.videos.set(metadata.uuid, video);
  });
</script>

<video muted class="hidden" bind:currentTime src={metadata.src} bind:this={video} on:loadedmetadata={handleBufferSetup} on:play={handlePlay} />
