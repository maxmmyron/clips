<script lang="ts">
  import { media, timeline, studio } from "$lib/stores";

  export let src: string;
  export let idx: number;

  let mediaEl: HTMLElement;
  let duration: number;
  let initialDragPosition: { x: number; y: number };

  $: isSelected = $media.selected.includes(idx);

  // for retrieving x/y component of spring store
  $: mousePos = $studio.mouse;

  const handleClick = (e: MouseEvent) => {
    if (e.detail === 2) $media.previewSource = src;
    else if (e.shiftKey) $media.selected = [...$media.selected, idx];
    else $media.selected = [idx];
  };

  const handleDragStart = (e: MouseEvent) => {
    initialDragPosition = { x: mediaEl.getBoundingClientRect().x, y: mediaEl.getBoundingClientRect().y };

    // snap ghost pos to element pos
    $studio.mouse.set({ x: mediaEl.getBoundingClientRect().x, y: mediaEl.getBoundingClientRect().y }, { hard: true });
    $studio.dragData = { duration, src };
  };

  const addToTimeline = () => ($timeline.clips = [...$timeline.clips, { duration, src, startOffset: 0, endOffset: 0 }]);
</script>

<button
  bind:this={mediaEl}
  on:click|stopPropagation={handleClick}
  class="relative outline-2 outline-blue-600 aspect-video w-48 bg-black rounded-md overflow-clip"
  class:outline={isSelected}
  on:mousedown={handleDragStart}
>
  {#if isSelected}<button class="absolute top-3 left-3" on:click|capture|stopPropagation={addToTimeline}>⬆️</button>{/if}
  <video class="w-full h-full object-contain" bind:duration>
    <source {src} type="video/mp4" />
    <track kind="captions" />
  </video>
</button>

{#if $studio.dragData?.src === src && $mousePos != initialDragPosition}
  <div class="z-10 absolute w-6 h-6 rounded-md bg-blue-400 transition-none" style="top: {$mousePos.y}px; left: {$mousePos.x}px" />
{/if}
