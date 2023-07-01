<script lang="ts">
  import { media } from "$lib/stores";
  import { onMount } from "svelte";
  import { addToast } from "$lib/util/toastManager";

  export let mediaUUID: string;
  export let metadata: { start: number; end: number };

  let resolved = $media.resolved.find((m) => m.uuid === mediaUUID) as App.Video | App.Audio;
  let buffer = resolved.metadata.audio.getChannelData(0);

  let width: number, height: number;
  let canvas: HTMLCanvasElement;

  onMount(() => {
    canvas.width = width;
    canvas.height = height;

    if (!buffer) {
      addToast("error", "Error loading audio preview: no audio buffer found.");
      return;
    }

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

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

    const start = (metadata.start / resolved.metadata.duration) * buffer.length;
    const end = ((resolved.metadata.duration - metadata.end) / resolved.metadata.duration) * buffer.length;

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
  });
</script>

<div class="h-1/2 flex justify-center items-center rounded-md overflow-clip" bind:clientWidth={width} bind:clientHeight={height}>
  <canvas class="w-full h-full" bind:clientWidth={width} bind:clientHeight={height} bind:this={canvas} />
</div>
