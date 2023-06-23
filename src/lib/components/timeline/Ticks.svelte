<script lang="ts">
  import { timeline } from "$lib/stores";

  export let scrollX: number;

  const tickHeights = [1, 1, 1, 2, 1, 1];

  let width: number;

  $: offset = Math.floor(scrollX / (width / 6));
  $: secondScale = Math.floor(($timeline.zoomScale - 50) / 10);
</script>

<div class="absolute w-full h-6 top-0 overflow-clip transform" translate="">
  <div class="w-[120%] h-full flex transform" bind:clientWidth={width} style="--tw-translate-x:-{scrollX % (width / 6)}px;">
    {#each { length: 6 } as _, i}
      <div class="relative flex w-1/5 h-full border-l-2 border-l-white">
        <p class="absolute text-white">{(i + offset) * 2 ** -secondScale}</p>
        {#each tickHeights as h}
          <div class="w-full border-l-2 border-l-white" style="height: {h * 12}px" />
        {/each}
      </div>
    {/each}
  </div>
</div>
