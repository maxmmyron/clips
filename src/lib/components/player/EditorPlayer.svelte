<script lang="ts">
  import { timeline, player } from "$lib/stores";
  // import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import { onMount } from "svelte";
  import Buffer from "./Buffer.svelte";

  export let width = 640,
    height = 480;

  let audioContext: AudioContext;

  // let render: Render;
  // $: render = ({ context, width, height }) => {
  //   $t;
  //   if ($timeline.timeline.length === 0 || !$timeline.current) return;
  //   const bufferEl = $timeline.sources.get($timeline.current.uuid)?.source;
  //   if (!bufferEl || !audioContext) return;

  //   // TODO: try to remove video width calculations outside of render so we aren't recomputing this every frame
  //   const bufferWidth = $timeline.current.type === "video" ? (bufferEl as HTMLVideoElement).videoWidth : bufferEl.width;
  //   const bufferHeight = $timeline.current.type === "video" ? (bufferEl as HTMLVideoElement).videoHeight : bufferEl.height;

  //   const mediaSize = {
  //     width: bufferWidth * Math.min(width / bufferWidth, height / bufferHeight),
  //     height: bufferHeight * Math.min(width / bufferWidth, height / bufferHeight),
  //   };

  //   const mediaPosition: [number, number] = [Math.max(0, (width - mediaSize.width) / 2), Math.max(0, (height - mediaSize.height) / 2)];

  //   context.drawImage(bufferEl, 0, 0, bufferWidth, bufferHeight, ...mediaPosition, mediaSize.width, mediaSize.height);
  // };

  function setPlayerTime(front: boolean = true): any {
    console.log(`skipping to ${front ? "front" : "back"}`);
    $player.isPaused = true;

    audioContext = new AudioContext();

    $timeline.runtime = front ? 0 : $timeline.duration;
    $timeline.current = front ? $timeline.timeline.head : $timeline.timeline.tail;
  }
</script>

<!-- TODO: this *will* filter out audio nodes, but a type error is thrown unless the Buffer.svelte element accepts all node types. Need to investigate and fix (shoddy types) -->
<!-- TODO: add node type functions to helpers.ts -->
{#each $timeline.timeline.toArray().filter((node) => node.type !== "audio") as node}
  <Buffer {audioContext} nodeUUID={node.uuid} />
{/each}

<div class="w-full h-full flex justify-center items-center">
  {#if $timeline.timeline.length}
    <p class="text-white">{$timeline.current?.uuid} ; {$timeline.current?.metadata.title}</p>
    <!-- <Canvas {width} {height}>
      <Layer {render} />
    </Canvas> -->
  {:else}
    <p class="text-neutral-400 font-mono">no clips in timeline （＞人＜；）</p>
  {/if}
</div>

<p class="w-full text-white text-right">{Math.round($timeline.runtime * 100) / 100 || 0}</p>

<div class="w-full flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed" on:click={() => setPlayerTime()}>
    ⏪
  </button>
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
    on:click={() => ($player.isPaused = !$player.isPaused)}
  >
    {$player.isPaused ? "▶️" : "⏸️"}
  </button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed" on:click={() => setPlayerTime(false)}>
    ⏩
  </button>
</div>
