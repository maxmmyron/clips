<script lang="ts">
  import { timeline } from "$lib/stores";

  export let scrollX: number;

  const tickHeights = [1, 1, 2, 1, 1, 1];

  let width: number;

  $: offset = Math.floor(scrollX / (width / 6));
  $: secondScale = 2 ** (5 - $timeline.zoomScale);
</script>

<div class="absolute w-full h-6 top-5 overflow-x-clip transform" translate="">
  <div class="w-[120%] h-full flex transform" bind:clientWidth={width} style="--tw-translate-x:-{scrollX % (width / 6)}px;">
    {#each { length: 6 } as _, i}
      <div class="relative flex w-1/5 h-full border-l-2 border-l-neutral-400">
        <p class="absolute text-neutral-300 -left-0.5 -top-6">{(i + offset) * secondScale}</p>
        {#each tickHeights as h, tickIdx}
          <div class="w-full {tickIdx !== tickHeights.length - 1 ? 'border-r-2 border-r-neutral-400' : ''}" style="height: {h * 12}px" />
        {/each}
      </div>
    {/each}
  </div>
</div>
