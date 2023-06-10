<script lang="ts">
  import { studio } from "$lib/stores";
  import { fade } from "svelte/transition";
  import Marquee from "./Marquee.svelte";

  $: media = $studio.draggable.media;
  $: pos = $studio.draggable.ghost.pos;
  $: size = $studio.draggable.ghost.size;
  $: region = $studio.draggable.current.region;
</script>

{#if media && $studio.draggable.event !== "start"}
  <div
    class="absolute z-10 w-max-[12rem] py-1 px-3 bg-neutral-800 border-2 border-neutral-700 {region === 'timeline'
      ? 'rounded-md'
      : 'rounded-full'} transition-none pointer-events-none flex items-center gap-4 {region !== 'timeline' && '-translate-y-[50%] -translate-x-[25%]'}"
    style="left: {$pos.x}px; top: {$pos.y}px; {region === 'timeline' && `width: ${$size.width}px;`} height: {$size.height}px;"
    transition:fade={{ duration: 150 }}
  >
    {#if region === null}
      <img alt="" src="/icons/{media.type}_dark.svg" class="w-4 h-4" />
      <div class="overflow-clip">
        <Marquee>{media.metadata.title}</Marquee>
      </div>
    {/if}
  </div>
{/if}
