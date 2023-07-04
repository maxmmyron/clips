<script lang="ts">
  import { timeline, buffers } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import Buffer from "./Buffer.svelte";

  export let width: number, height: number;

  $: console.log($timeline.current?.uuid ?? null);

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if (!$timeline.current || $timeline.current.type === "audio") {
      context.fillStyle = "black";
      context.fillRect(0, 0, width, height);
      return;
    }

    let src = $buffers.get($timeline.current.uuid);
    console.log($buffers, [...$buffers]);
    if (!src) return;

    const bufferWidth = src.type === "video" ? (src.source as HTMLVideoElement).videoWidth : (src.source as HTMLImageElement).width || 0;
    const bufferHeight = src.type === "video" ? (src.source as HTMLVideoElement).videoHeight : (src.source as HTMLImageElement).height || 0;

    console.log(`buffer width/height: ${bufferWidth}, ${bufferHeight}`);

    const mediaSize = {
      width: bufferWidth * Math.min(width / bufferWidth, height / bufferHeight),
      height: bufferHeight * Math.min(width / bufferWidth, height / bufferHeight),
    };

    console.log(`mediaSize: ${mediaSize}`);

    const mediaPosition: [number, number] = [Math.max(0, (width - mediaSize.width) / 2), Math.max(0, (height - mediaSize.height) / 2)];

    console.log(`mediaPos: ${mediaPosition}`);

    context.drawImage(src.source, 0, 0, bufferWidth, bufferHeight, ...mediaPosition, mediaSize.width, mediaSize.height);
  };
</script>

{#each $timeline.clips.toArray() as node}
  <Buffer {node} />
{/each}

<Canvas {width} {height}>
  <Layer {render} />
</Canvas>
