<script lang="ts">
  import { onMount } from "svelte";

  export let audioData: Float32Array;

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const step = Math.ceil(audioData.length / canvas.width);

    const ctx = canvas.getContext("2d");
    if (!ctx) return console.error("Could not get canvas context");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";

    ctx.beginPath();

    // if empty, just draw a line
    if (audioData.every((datum) => datum === 0)) {
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      return;
    }

    for (let i = 0; i < canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;

      // loop over step-sized chunks of data, find min and max, and draw to screen for that "pixel column"
      for (let j = 0; j < step; j++) {
        const datum = audioData[i * step + j];

        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      ctx.moveTo(i, ((1 + min) * canvas.height) / 2);
      ctx.lineTo(i, ((1 + max) * canvas.height) / 2);
    }
    ctx.stroke();
  });
</script>

<div class="w-full h-1/2 flex justify-center items-center rounded-md overflow-clip">
  <canvas class="w-full h-full" bind:this={canvas} />
</div>
