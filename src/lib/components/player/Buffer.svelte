<script lang="ts">
  import { MediaType } from "$lib/exports";
  import { player, timeline } from "$lib/stores";
  import { onMount } from "svelte";

  // only accept video and image (we don't need a loaded audio element to handle audio data)
  export let node: TimelineLayerNode<TimelineVideo | TimelineImage>, audioContext: AudioContext;
  const metadata: TimelineVideo | TimelineImage = node.metadata;

  let video: HTMLVideoElement, image: HTMLImageElement, audioNode: AudioBufferSourceNode;
  let audioStartTime: number = 0,
    audioPauseTime: number = 0;

  $: metadata.currentTime = audioPauseTime - audioStartTime;

  $: if (audioNode) {
    if ($player.isPaused) {
      audioNode.disconnect();
      audioPauseTime = audioContext.currentTime - audioStartTime;
    }
  }
  // handle video playback if dealing with video el
  $: if (node === $timeline.curr && video) !$player.isPaused ? video.play() : video.pause();

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
    if (metadata.hasStarted) startOffset = metadata.offsets[0] + (metadata.currentTime - metadata.offsets[0]);

    console.log(`playing from ${startOffset} to ${metadata.duration - metadata.offsets[1] - startOffset}`);

    audioStartTime = audioContext.currentTime - startOffset;
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
