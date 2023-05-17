<!-- <script lang="ts">
  import { MediaType } from "$lib/exports";
  import { timeline, player } from "$lib/stores";
  import { onMount } from "svelte";

  export let node: TimelineLayerNode, audioContext: AudioContext;
  const metadata = node.metadata;

  let video: HTMLVideoElement, image: HTMLImageElement;
  let currentTime: number = 0;
  let audioNode: AudioBufferSourceNode;

  $: if (audioNode) $player.isPaused && audioNode.disconnect();
  $: if (node === $timeline.curr && video) !$player.isPaused ? video.play() : video.pause();

  $: if (
    video &&
    video === $timeline.videos.get($timeline.curr?.uuid || "") &&
    currentTime - metadata.offsets[0] >= metadata.duration - metadata.offsets[0] - metadata.offsets[1]
  ) {
    if (audioNode) audioNode.disconnect();
    if (node === $timeline.clips.tail) $player.isPaused = true;
    else $timeline.curr = node.next;
    metadata.hasEnded = true;
  }

  const handlePlay = () => {
    if (metadata.type !== MediaType.IMAGE) {
      audioNode = audioContext.createBufferSource();

      const audioNodeBuffer = audioContext.createBuffer(metadata.audio.numberOfChannels, metadata.audio.length, metadata.audio.sampleRate);
      for (let i = 0; i < metadata.audio.numberOfChannels; i++) audioNodeBuffer.copyToChannel(metadata.audio.getChannelData(i), i);

      audioNode.buffer = audioNodeBuffer;
    } else {
      // create empty audio buffer for image
      audioNode = audioContext.createBufferSource();
      audioNode.buffer = audioContext.createBuffer(1, metadata.duration * 44100, 44100);
    }

    let startOffset = metadata.offsets[0];
    // if video has started, then resume from initial position
    if (metadata.hasStarted) startOffset = metadata.offsets[0] + (currentTime - metadata.offsets[0]);

    console.log(`playing from ${startOffset} to ${metadata.duration - metadata.offsets[1] - startOffset}`);

    currentTime = startOffset;
    metadata.hasStarted = true;
    const duration = metadata.duration - metadata.offsets[1] - startOffset;
    audioNode.connect(audioContext.destination);
    audioNode.start(0, startOffset, duration);
  };

  onMount(() => {
    if (!video) throw new Error("No buffer");
    $timeline.videos.set(node.uuid, video);
  });
</script>

{#if metadata.type === MediaType.VIDEO}
  <video
    muted
    class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0"
    bind:currentTime
    src={metadata.src}
    bind:this={video}
    on:play={handlePlay}
  />
{:else if metadata.type === MediaType.IMAGE}
  <!-- TODO: handle currentTime
  <img class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={metadata.src} bind:this={image} alt="" />
{/if} -->
