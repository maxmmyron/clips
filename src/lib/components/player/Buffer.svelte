<script lang="ts">
  import { MediaType } from "$lib/exports";
  import { player, timeline } from "$lib/stores";
  import { onMount } from "svelte";

  // TODO: fix this so we only accept video and image buffers.
  export let node: TimelineLayerNode<TimelineVideo | TimelineImage | TimelineAudio>, audioContext: AudioContext;

  const metadata = node.metadata;
  let video: HTMLVideoElement, image: HTMLImageElement, audioNode: AudioBufferSourceNode | undefined;

  /**
   * A private timestamp of the timestamp at last pause. Used to calculate value for accumulatedPauseOffset.
   */
  let lastPauseTimestamp = 0,
    lastStartOffset = 0;

  // handle video playback if dealing with video el
  $: if (node === $timeline.curr && video) !$player.isPaused ? video.play() : video.pause();
  $: if (audioNode && $player.isPaused) audioNode.disconnect();

  // update timestamps
  $: $player.isPaused && (lastPauseTimestamp = audioContext.currentTime);

  if (audioNode && node.uuid == $timeline.curr?.uuid)
    audioNode.addEventListener("ended", () => {
      console.log("ended");
      audioNode && audioNode.disconnect();
      metadata.hasEnded = true;
      if (node === $timeline.clips.tail) $player.isPaused = true;
      else $timeline.curr = node.next;
    });

  const handlePlay = () => {
    audioNode = audioContext.createBufferSource();

    if (metadata.type === MediaType.VIDEO) {
      const audioNodeBuffer = audioContext.createBuffer(metadata.audio.numberOfChannels, metadata.audio.length, metadata.audio.sampleRate);
      for (let i = 0; i < metadata.audio.numberOfChannels; i++) audioNodeBuffer.copyToChannel(metadata.audio.getChannelData(i), i);
      audioNode.buffer = audioNodeBuffer;
    } else {
      // create empty audio buffer for image
      audioNode.buffer = audioContext.createBuffer(1, metadata.duration * 44100, 44100);
    }

    let currCtxTimestamp = audioContext.currentTime;

    let startOffset = metadata.offsets[0];
    if (!metadata.hasStarted) {
      metadata.startTimestamp = currCtxTimestamp;
      metadata.hasStarted = true;
    } else {
      startOffset = metadata.offsets[0] + metadata.runtime;
      metadata.accumulatedPauseOffset += currCtxTimestamp - lastPauseTimestamp;
    }

    lastStartOffset = currCtxTimestamp;

    const duration = metadata.duration - metadata.offsets[1] - startOffset;
    console.log(`playing from ${startOffset}s to ${metadata.duration - metadata.offsets[1]}s (${duration} seconds)`);
    audioNode.connect(audioContext.destination);
    audioNode.start(0, startOffset, duration);
  };

  onMount(() => {
    if (!video && !image) throw new Error("No buffer to mount.");
    $timeline.buffers.set(node.uuid, video || image);
  });
</script>

{#if metadata.type === MediaType.VIDEO}
  <video muted class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={metadata.src} bind:this={video} on:play={handlePlay} />
{:else if metadata.type === MediaType.IMAGE}
  <img class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={metadata.src} bind:this={image} alt="" />
{/if}
