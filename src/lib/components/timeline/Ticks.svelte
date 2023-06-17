<script lang="ts">
  import { timeline } from "$lib/stores";

  export let timelineWidth: number;
  export let scrollX: number;

  let canvas: HTMLCanvasElement;

  let lastScrollX = 0;
  let lastZoom = 0;

  $: ctx = canvas?.getContext("2d") ?? null;
  $: if (ctx) {
    if (lastScrollX !== scrollX || lastZoom !== $timeline.zoomScale) {
      lastScrollX = scrollX;
      lastZoom = $timeline.zoomScale;
      draw(ctx);
    }
  }

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let wrap = Math.ceil(scrollX / $timeline.zoomScale);

    for (let i = 0; i < numTicks; i++) {
      let x = ((i - scrollX / $timeline.zoomScale) * $timeline.zoomScale) % timelineWidth;
      if (x < 0) x += timelineWidth;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 48);
      ctx.stroke();

      ctx.font = "16px Arial";
      ctx.strokeText(`${i + wrap}`, x + 4, 16);
    }
  };

  $: numTicks = Math.ceil(timelineWidth / $timeline.zoomScale);
</script>

<canvas class="absolute w-full h-6 top-0 transform" style="--tw-translate-x: {scrollX}px;" bind:this={canvas} width={timelineWidth} height="24" />
