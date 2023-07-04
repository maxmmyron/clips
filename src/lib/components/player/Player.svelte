<script lang="ts">
  import { timeline, buffers } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import Buffer from "./Buffer.svelte";
  import { browser } from "$app/environment";

  $: browser && (window.buffers = $buffers);

  export let width: number, height: number;

  $: src = $timeline.current && $buffers.get($timeline.current.uuid);

  let sourceDim: [number, number], mediaDim: [number, number], mediaPos: [number, number];

  $: if (src) {
    if (src.type === "video") sourceDim = [(src.source as HTMLVideoElement).videoWidth, (src.source as HTMLVideoElement).videoHeight];
    else sourceDim = [src.source.width, src.source.height];

    mediaDim = [sourceDim[0] * Math.min(width / sourceDim[0], height / sourceDim[1]), sourceDim[1] * Math.min(width / sourceDim[0], height / sourceDim[1])];

    mediaPos = [Math.max(0, (width - mediaDim[0]) / 2), Math.max(0, (height - mediaDim[1]) / 2)];
  }

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if (!$timeline.current || $timeline.current.type === "audio") {
      context.fillStyle = "black";
      context.fillRect(0, 0, width, height);
      return;
    }

    if (!src) return;
    context.drawImage(src.source, 0, 0, ...sourceDim, ...mediaPos, ...mediaDim);
  };
</script>

{#each $timeline.clips.toArray() as node}
  <Buffer {node} />
{/each}

<Canvas {width} {height}>
  <Layer {render} />
</Canvas>
