<script lang="ts">
  import { timeline } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import Buffer from "./Buffer.svelte";

  export let width: number, height: number;

  let audioContext: AudioContext = new AudioContext();

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if (!$timeline.current) {
      context.fillStyle = "black";
      context.fillRect(0, 0, width, height);
      return;
    }

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
</script>

{#each $timeline.timeline.toArray() as node}
  {#if node.type !== "audio"}
    <Buffer nodeUUID={node.uuid} {audioContext} />
  {/if}
{/each}

<Canvas {width} {height}>
  <Layer {render} />
</Canvas>
