<script lang="ts">
  import { timeline } from "$lib/stores";

  export let timelineWidth: number;
  export let scrollX: number;

  let canvas: HTMLCanvasElement;

  $: ctx = canvas?.getContext("2d") ?? null;
  $: if (ctx) {
    ctx.strokeStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numTicks; i++) {
      const x = i * $timeline.zoomScale;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 48);
      ctx.stroke();
    }
  }

  $: numTicks = Math.ceil(timelineWidth / $timeline.zoomScale);
</script>

<canvas class="absolute w-full h-12 bg-black top-0 transform" style="--tw-translate-x: {scrollX}px;" bind:this={canvas} width={timelineWidth} height="48" />
