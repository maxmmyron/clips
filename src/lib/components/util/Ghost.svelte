<script lang="ts">
  import { mediaPool, studio } from "$lib/stores";
  import { fade } from "svelte/transition";
  import Marquee from "./Marquee.svelte";
  import Icon from "./Icon.svelte";

  $: media = $mediaPool.media.find((m) => m.uuid === $studio.draggable.mediaUUID);
  $: pos = $studio.draggable.ghost.pos;
  $: size = $studio.draggable.ghost.size;
  $: region = $studio.draggable.current.region;
</script>

{#if media && $studio.draggable.event !== "start"}
  <div
    class="absolute z-10 {region === null && 'max-w-[12rem]'} py-1 px-3 bg-neutral-800 border-2 border-neutral-700 {region === 'timeline'
      ? 'rounded-md'
      : 'rounded-full'} overflow-clip transition-none pointer-events-none flex items-center gap-4 {region !== 'timeline' &&
      '-translate-y-[50%] -translate-x-[25%]'}"
    style="left: {$pos.x}px; top: {$pos.y}px; {region === 'timeline' && `width: ${$size.width}px;`} height: {$size.height}px;"
    transition:fade={{ duration: 150 }}
  >
    {#if region === null}
      <Icon src="/icons/{media.type}.svg" />
      <div class="overflow-clip flex-1" style="width: calc(100% - 3rem);">
        <Marquee primaryColor={"neutral-800"}>{media.metadata.title}</Marquee>
      </div>
    {/if}
  </div>
{/if}
