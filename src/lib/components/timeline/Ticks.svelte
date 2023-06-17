<script lang="ts">
  import { timeline } from "$lib/stores";
  import { onMount } from "svelte";

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

  onMount(() => ctx && draw(ctx));

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numTicks; i++) {
      let x = ((i - scrollX / $timeline.zoomScale) * $timeline.zoomScale) % timelineWidth;
      // if x <= 0, add i + numTicks * number of wraps
      if (x < 0) x += timelineWidth;

      const wrap = Math.floor((timelineWidth - (i - (scrollX - 1) / $timeline.zoomScale) * $timeline.zoomScale) / timelineWidth);

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 48);
      ctx.stroke();

      ctx.font = "16px Arial";
      ctx.strokeText(`${i + wrap * numTicks}`, x + 4, 16);
    }
  };

  $: numTicks = Math.ceil(timelineWidth / $timeline.zoomScale);
</script>

<canvas class="absolute w-full h-6 top-0 transform" style="--tw-translate-x: {scrollX}px;" bind:this={canvas} width={timelineWidth} height="24" />
