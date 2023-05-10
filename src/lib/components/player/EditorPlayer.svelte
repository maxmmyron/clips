<script lang="ts">
  import { timeline } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import { onMount } from "svelte";
  import VideoBuffer from "./VideoBuffer.svelte";

  export let width = 640,
    height = 480;

  let isPaused = true;
  let currentPreviewTime = 0;

  let audioContext: AudioContext;

  onMount(() => {
    audioContext = new AudioContext();
  });

  $: if (audioContext) isPaused ? audioContext.suspend() : audioContext.resume();
  $: if (currentBuffer) isPaused ? currentBuffer.video.pause() : currentBuffer.video.play();
  $: accumulatedTime = $timeline.clips.slice(0, $timeline.currentBufferIndex).reduce((acc, cur) => acc + (cur.duration - cur.startTime - cur.endTime), 0);
  $: currentBuffer = $timeline.buffers[$timeline.currentBufferIndex];
  $: if ($timeline.currentBufferIndex === -1 && $timeline.buffers.length > 0) $timeline.currentBufferIndex = 0;
  $: video = currentBuffer?.video;
  $: metadata = currentBuffer?.metadata;

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if ($timeline.buffers.length === 0 || !currentBuffer) return;
    currentPreviewTime = video.currentTime - metadata.startTime;

    // TODO: no need to recompute this every frame
    const mediaSize = {
      width: video.videoWidth * Math.min(width / video.videoWidth, height / video.videoHeight),
      height: video.videoHeight * Math.min(width / video.videoWidth, height / video.videoHeight),
    };

    const mediaPosition: [number, number] = [Math.max(0, (width - mediaSize.width) / 2), Math.max(0, (height - mediaSize.height) / 2)];

    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, ...mediaPosition, mediaSize.width, mediaSize.height);
  };

  function setPlayerTime(front: boolean = true): any {
    isPaused = true;
    if (front) {
      for (let i = 0; i < $timeline.buffers.length; i++) $timeline.buffers[i].video.currentTime = $timeline.clips[i].startTime;
      $timeline.currentBufferIndex = 0;
      video.currentTime = metadata.startTime;
    } else {
      $timeline.currentBufferIndex = $timeline.buffers.length - 1;
      video.currentTime = metadata.duration - metadata.startTime - metadata.endTime;
    }
  }

  const togglePlayState = () => {
    const currentMetadata = $timeline.clips[$timeline.currentBufferIndex];
    const isLastClip = $timeline.currentBufferIndex === $timeline.buffers.length - 1;
    const isLastFrame = currentPreviewTime >= currentMetadata.duration - currentMetadata.startTime - currentMetadata.endTime;
    if (isLastClip && isLastFrame) {
      setPlayerTime();
    }
    isPaused = !isPaused;
  };
</script>

{#key $timeline.clips}
  {#each $timeline.clips as metadata}
    <VideoBuffer {audioContext} {isPaused} {metadata} />
  {/each}
{/key}

<div class="w-full h-full flex justify-center items-center">
  {#if $timeline.clips.length}
    <Canvas {width} {height}>
      <Layer {render} />
    </Canvas>
  {:else}
    <p class="text-neutral-400 font-mono">no clips in timeline （＞人＜；）</p>
  {/if}
</div>

<p class="w-full text-white text-right">{Math.round((accumulatedTime + currentPreviewTime) * 100) / 100 || 0}</p>

<div class="w-full flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime()}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={togglePlayState}>{isPaused ? "▶️" : "⏸️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(false)}>⏩</button>
</div>
