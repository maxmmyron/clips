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
  $: if (currentBuffer) isPaused ? currentBuffer.pause() : currentBuffer.play();
  $: accumulatedTime = $timeline.clips.slice(0, $timeline.currentBufferIndex).reduce((acc, cur) => acc + (cur.duration - cur.startTime - cur.endTime), 0);
  $: currentBuffer = $timeline.buffers[$timeline.currentBufferIndex];
  $: currentMetadata = $timeline.clips[$timeline.currentBufferIndex];

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if ($timeline.buffers.length === 0 || !currentBuffer) return;
    currentPreviewTime = currentBuffer.currentTime - currentMetadata.startTime;

    console.log($timeline.currentBufferIndex);

    // TODO: no need to recompute this every frame
    const mediaSize = {
      width: currentBuffer.videoWidth * Math.min(width / currentBuffer.videoWidth, height / currentBuffer.videoHeight),
      height: currentBuffer.videoHeight * Math.min(width / currentBuffer.videoWidth, height / currentBuffer.videoHeight),
    };

    const mediaPosition: [number, number] = [Math.max(0, (width - mediaSize.width) / 2), Math.max(0, (height - mediaSize.height) / 2)];

    context.drawImage(currentBuffer, 0, 0, currentBuffer.videoWidth, currentBuffer.videoHeight, ...mediaPosition, mediaSize.width, mediaSize.height);
  };

  function setPlayerTime(front: boolean = true): any {
    isPaused = true;
    if (front) {
      $timeline.currentBufferIndex = 0;
      currentBuffer.currentTime = currentMetadata.startTime;
    } else {
      // TODO: kinda shitty code; probably should directly set src attribute of preview. Works for now but consider refactoring
      // [bufferAIdx, bufferBIdx] = [$timeline.clips.length - 1, $timeline.clips.length];
      // preview = videoA;
      // preview.load();
      // preview.addEventListener("loadedmetadata", () => (preview.currentTime = preview.duration - currentMetadata.startTime));
    }
  }

  const togglePlayState = () => {
    const isLastClip = $timeline.currentBufferIndex === $timeline.buffers.length - 1;
    const isLastFrame = currentPreviewTime >= currentMetadata.duration - currentMetadata.startTime - currentMetadata.endTime;
    if (isLastClip && isLastFrame) {
      setPlayerTime();
    }
    isPaused = !isPaused;
  };
</script>

{#each $timeline.clips as metadata, i}
  <VideoBuffer {audioContext} {isPaused} {metadata} />
{/each}

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
