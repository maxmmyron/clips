<script lang="ts">
  import { timeline, player } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import Buffer from "./Buffer.svelte";

  export let width = 640,
    height = 480;

  let audioContext: AudioContext = new AudioContext();

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;

    if (!$timeline.current) return;

    if ($timeline.current.type === "audio") {
      context.fillStyle = "black";
      context.fillRect(0, 0, width, height);
      return;
    }

    let src = $timeline.sources.get($timeline.current.uuid);
    if (!src) return;

    const bufferWidth = src.type === "video" ? (src.source as HTMLVideoElement).videoWidth : (src.source as HTMLImageElement).width || 0;
    const bufferHeight = src.type === "video" ? (src.source as HTMLVideoElement).videoHeight : (src.source as HTMLImageElement).height || 0;

    const mediaSize = {
      width: bufferWidth * Math.min(width / bufferWidth, height / bufferHeight),
      height: bufferHeight * Math.min(width / bufferWidth, height / bufferHeight),
    };

    const mediaPosition: [number, number] = [Math.max(0, (width - mediaSize.width) / 2), Math.max(0, (height - mediaSize.height) / 2)];

    context.drawImage(src.source, 0, 0, bufferWidth, bufferHeight, ...mediaPosition, mediaSize.width, mediaSize.height);
  };

  function setPlayerTime(front: boolean = true): any {
    console.log(`skipping to ${front ? "front" : "back"}`);
    $player.isPaused = true;

    $timeline.runtime = front ? 0 : $timeline.duration;
    $timeline.current = front ? $timeline.timeline.head : $timeline.timeline.tail;
  }
</script>

<!-- TODO: this *will* filter out audio nodes, but a type error is thrown unless the Buffer.svelte element accepts all node types. Need to investigate and fix (shoddy types) -->
<!-- TODO: add node type functions to helpers.ts -->
{#each $timeline.timeline.toArray() as node}
  <Buffer nodeUUID={node.uuid} {audioContext} />
{/each}

<div class="w-full h-full flex justify-center items-center">
  {#if $timeline.timeline.length}
    <Canvas {width} {height}>
      <Layer {render} />
    </Canvas>
  {:else}
    <p class="text-neutral-400 font-mono">no clips in timeline （＞人＜；）</p>
  {/if}
</div>

<div class="flex justify-betweem">
  <p class="text-white w-full text-right">{Math.round($timeline.runtime * 100) / 100 || 0}</p>
</div>

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
