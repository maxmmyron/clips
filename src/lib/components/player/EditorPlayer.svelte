<script lang="ts">
  import { timeline, player } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import { onMount } from "svelte";
  import VideoBuffer from "./VideoBuffer.svelte";

  export let width = 640,
    height = 480;

  let previewTime = 0,
    accumulatedTime = 0;
  let audioContext: AudioContext;

  onMount(() => (audioContext = new AudioContext()));

  $: if ($timeline.curr) {
    const accumulatorClips = $timeline.clips.toArray().slice(0, $timeline.clips.indexOf($timeline.curr.uuid));
    accumulatedTime = accumulatorClips.reduce((acc, { metadata }) => acc + (metadata.duration - metadata.startOffset - metadata.endOffset), 0);
  }

  $: if (!$timeline.curr && $timeline.clips.length > 0) $timeline.curr = $timeline.clips.head;

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if ($timeline.clips.length === 0 || !$timeline.curr) return;

    const metadata = $timeline.curr.metadata;
    const video = $timeline.videos.get($timeline.curr.uuid);

    if (!video) return;

    previewTime = video.currentTime - metadata.startOffset;

    // TODO: no need to recompute this every frame
    const mediaSize = {
      width: video.videoWidth * Math.min(width / video.videoWidth, height / video.videoHeight),
      height: video.videoHeight * Math.min(width / video.videoWidth, height / video.videoHeight),
    };

    const mediaPosition: [number, number] = [Math.max(0, (width - mediaSize.width) / 2), Math.max(0, (height - mediaSize.height) / 2)];

    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, ...mediaPosition, mediaSize.width, mediaSize.height);
  };

  function setPlayerTime(front: boolean = true): any {
    $player.isPaused = true;

    $timeline.clips.toArray().forEach((clip) => {
      clip.metadata.hasEnded = !front;
      clip.metadata.hasStarted = !front;
    });

    if (front) {
      console.log("resetting state to head");
      $timeline.curr = $timeline.clips.head;
      previewTime = 0;
    } else {
      console.log("resetting state to tail");
      $timeline.curr = $timeline.clips.tail;
      // set last video time
      if (!$timeline.curr) return;
      const metadata = $timeline.curr.metadata;
      const video = $timeline.videos.get($timeline.curr.uuid);
      if (video) video.currentTime = metadata.duration - metadata.startOffset - metadata.endOffset;
      previewTime = metadata.duration - metadata.startOffset - metadata.endOffset;
    }
  }

  const togglePlayState = () => {
    console.log("toggling play state...");
    if (!$timeline.curr) return;
    if ($timeline.curr === $timeline.clips.tail && $timeline.curr.metadata.hasEnded) setPlayerTime();
    $player.isPaused = !$player.isPaused;
  };
</script>

{#each $timeline.clips.toArray() as node}
  <VideoBuffer {audioContext} {node} />
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

<p class="w-full text-white text-right">{Math.round((accumulatedTime + previewTime) * 100) / 100 || 0}</p>

<div class="w-full flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime()}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={togglePlayState}>{$player.isPaused ? "▶️" : "⏸️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(false)}>⏩</button>
</div>
