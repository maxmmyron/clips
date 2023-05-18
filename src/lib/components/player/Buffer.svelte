<script lang="ts">
  import { MediaType } from "$lib/exports";
  import { player, timeline } from "$lib/stores";
  import { onMount } from "svelte";

  // TODO: fix this so we only accept video and image buffers.
  export let node: TimelineLayerNode<TimelineVideo | TimelineImage | TimelineAudio>, audioContext: AudioContext;

  const metadata = node.metadata;

  let video: HTMLVideoElement, image: HTMLImageElement, audioNode: AudioBufferSourceNode;
  let playOffset = 0,
    pauseOffset = 0;
  let lastStartTime = 0,
    lastPauseTime = 0;

  $: {
    audioContext.currentTime;
    console.log("abc");
    metadata.runtime = $player.isPaused ? lastPauseTime : audioContext.currentTime - lastStartTime;
  }

  // $: metadata.runtime = $player.isPaused ? lastPauseTime : audioContext.currentTime - lastStartTime;
  $: lastPauseTime = $player.isPaused ? audioContext.currentTime - lastStartTime : lastPauseTime;
  // handle video playback if dealing with video el
  $: if (node === $timeline.curr && video) !$player.isPaused ? video.play() : video.pause();

  $: if (audioNode) {
    if ($player.isPaused) {
      audioNode.disconnect();
      lastPauseTime = audioContext.currentTime - lastStartTime;
    }
  }

  $: if (node.uuid === $timeline.curr?.uuid && metadata.runtime >= metadata.duration - metadata.offsets.reduce((p, c) => p + c)) {
    console.log("ended");
    audioNode.disconnect();
    metadata.hasEnded = true;
    if (node === $timeline.clips.tail) $player.isPaused = true;
    else $timeline.curr = node.next;
  }

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

    let startOffset = metadata.offsets[0];
    // set initial start time (to track play/pause)
    if (!metadata.hasStarted) {
      lastStartTime = startOffset;
    } else {
      startOffset = metadata.offsets[0] + (lastPauseTime - lastStartTime);
      lastStartTime = audioContext.currentTime - lastPauseTime;
    }

    console.log(`playing from ${startOffset} to ${metadata.duration - metadata.offsets[1] - startOffset}`);
    metadata.hasStarted = true;
    const duration = metadata.duration - metadata.offsets[1] - startOffset;
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
