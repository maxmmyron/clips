<script lang="ts">
  import { timeline, player } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import { onMount } from "svelte";
  import Buffer from "./Buffer.svelte";
  import { MediaType } from "$lib/exports";

  export let width = 640,
    height = 480;

  let previewTime = 0,
    accumulatedTime = 0;
  let audioContext: AudioContext;

  onMount(() => (audioContext = new AudioContext()));

  $: if ($timeline.curr) {
    const accumulatorClips = $timeline.clips.toArray().slice(0, $timeline.clips.indexOf($timeline.curr.uuid));
    accumulatedTime = accumulatorClips.reduce((acc, { metadata }) => acc + (metadata.duration - metadata.offsets[0] - metadata.offsets[1]), 0);
  }

  // update current clip on add
  $: if (!$timeline.curr && $timeline.clips.length > 0) $timeline.curr = $timeline.clips.head;

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if ($timeline.clips.length === 0 || !$timeline.curr) return;
    const bufferEl = $timeline.buffers.get($timeline.curr.uuid);
    if (!bufferEl || !audioContext) return;

    const metadata = $timeline.curr.metadata;
    if (!$player.isPaused) {
      metadata.runtime = audioContext.currentTime - metadata.startTimestamp - metadata.accumulatedPauseOffset;
      previewTime = metadata.runtime;
    }

    // TODO: try to remove video width calculations outside of render so we aren't recomputing this every frame
    const bufferWidth = metadata.type === MediaType.VIDEO ? (bufferEl as HTMLVideoElement).videoWidth : bufferEl.width;
    const bufferHeight = metadata.type === MediaType.VIDEO ? (bufferEl as HTMLVideoElement).videoHeight : bufferEl.height;

    const mediaSize = {
      width: bufferWidth * Math.min(width / bufferWidth, height / bufferHeight),
      height: bufferHeight * Math.min(width / bufferWidth, height / bufferHeight),
    };

    const mediaPosition: [number, number] = [Math.max(0, (width - mediaSize.width) / 2), Math.max(0, (height - mediaSize.height) / 2)];

    context.drawImage(bufferEl, 0, 0, bufferWidth, bufferHeight, ...mediaPosition, mediaSize.width, mediaSize.height);
  };

  function setPlayerTime(front: boolean = true): any {
    $player.isPaused = true;

    $timeline.clips.toArray().forEach((clip) => {
      if (!$timeline.curr) return;
      const metadata = $timeline.curr.metadata;
      const bufferEl = $timeline.buffers.get($timeline.curr.uuid);

      if (!bufferEl) return;
      console.log(`setting ${clip.uuid} to ${front ? clip.metadata.offsets[0] : clip.metadata.duration - clip.metadata.offsets[1]}`);

      metadata.runtime = front ? clip.metadata.offsets[0] : clip.metadata.duration - clip.metadata.offsets[1];
      clip.metadata.hasEnded = !front;
      clip.metadata.hasStarted = !front;
    });

    $timeline.curr = front ? $timeline.clips.head : $timeline.clips.tail;
  }

  const togglePlayState = () => {
    console.log("toggling play state...");
    if (!$timeline.curr) return;
    if (!$timeline.clips.tail) throw new Error("Timeline tail is null... Something has gone horribly wrong. (Button was clicked despite timeline being empty)");
    if ($timeline.curr.uuid === $timeline.clips.tail.uuid && $timeline.curr.metadata.hasEnded) setPlayerTime();
    $player.isPaused = !$player.isPaused;
  };
</script>

{#key $timeline.clips}
  <!-- TODO: this *will* filter out audio nodes, but a type error is thrown unless the Buffer.svelte element accepts all node types. Need to investigate and fix (shoddy types) -->
  {#each $timeline.clips.toArray().filter((node) => node.metadata.type !== MediaType.AUDIO) as node}
    <Buffer {audioContext} {node} />
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

<p class="w-full text-white text-right">{Math.round((accumulatedTime + previewTime) * 100) / 100 || 0}</p>

<div class="w-full flex justify-center gap-4">
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
    on:click={() => setPlayerTime()}
    disabled={$timeline.curr === null || ($timeline.curr === $timeline.clips.head && !$timeline.curr.metadata.hasStarted)}
  >
    ⏪
  </button>
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
    on:click={togglePlayState}
    disabled={$timeline.curr === null}
  >
    {$player.isPaused ? "▶️" : "⏸️"}
  </button>
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
    on:click={() => setPlayerTime(false)}
    disabled={$timeline.curr === null || ($timeline.curr === $timeline.clips.tail && $timeline.curr.metadata.hasEnded)}
  >
    ⏩
  </button>
</div>
