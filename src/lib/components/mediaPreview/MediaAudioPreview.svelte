<script lang="ts">
  import { mediaPool, timeline } from "$lib/stores";
  import { Canvas, Layer, type Render } from "svelte-canvas";

  export let mediaUUID: string;
  export let metadata: { start: number; end: number };

  const media = $mediaPool.media.find((media) => media.uuid === mediaUUID) as App.AudioMedia;

  let buffer = media.metadata.audio.getChannelData(0);
  let containerWidth, containerHeight;

  let render: Render;
  $: render = ({ context, width, height }) => {
    // recalc on zoom
    $timeline.zoomScale;

    if (!buffer) return console.error("No audio data");

    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);
    context.lineWidth = 1;
    context.strokeStyle = "white";

    context.beginPath();

    // if empty, just draw a line
    if (buffer.every((datum) => datum === 0)) {
      context.moveTo(0, height / 2);
      context.lineTo(width, height / 2);
      context.stroke();
      return;
    }

    const start = (metadata.start / media.metadata.duration) * buffer.length;
    const end = ((media.metadata.duration - metadata.end) / media.metadata.duration) * buffer.length;

    const offsetBuffer = buffer.slice(start, end);

    const step = Math.ceil(offsetBuffer.length / width);

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      // loop over step-sized chunks of data, find min and max, and draw to screen for that "pixel column"
      for (let j = 0; j < step; j++) {
        const datum = offsetBuffer[i * step + j];

        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      context.moveTo(i, ((1 + min) * height) / 2);
      context.lineTo(i, ((1 + max) * height) / 2);
    }
    context.stroke();
  };
</script>

<div class="h-1/2 flex justify-center items-center rounded-md overflow-clip" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
  <Canvas class="w-full h-full" width={containerWidth} height={containerHeight}>
    <Layer {render} />
  </Canvas>
</div>
