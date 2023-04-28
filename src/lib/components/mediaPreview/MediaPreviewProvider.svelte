<script lang="ts">
  import { mediaPool, studio, timeline } from "$lib/stores";

  export let metadata: StudioMediaMetadata;
  export let store: WritableMediaPool | WritableTimeline;

  $: isTimelineElement = store === timeline;

  let width = "12rem";
  metadata.duration.then((dur) => (width = isTimelineElement ? (dur - metadata.startTime - metadata.endTime) * $timeline.zoomScale + "px" : "12rem"));

  let mediaPreview: HTMLButtonElement, initialMousePos: { x: number; y: number };

  $: isSelected = $store.selected.includes(metadata);
  $: mousePos = $studio.mouse;

  const handleClick = (e: MouseEvent) => {
    if (e.detail == 2) $mediaPool.previewSrc = metadata;
    else if (e.shiftKey) $store.selected = [...$store.selected, metadata];
    else $store.selected = [metadata];
  };

  const handleDragStart = (e: MouseEvent) => {
    $studio.dragData = metadata;

    initialMousePos = { x: mediaPreview.getBoundingClientRect().x, y: mediaPreview.getBoundingClientRect().y };

    // snap ghost pos to element pos
    $studio.mouse.set({ x: mediaPreview.getBoundingClientRect().x, y: mediaPreview.getBoundingClientRect().y }, { hard: true });
  };
</script>

<button
  bind:this={mediaPreview}
  style="width: {width};"
  on:click|stopPropagation={handleClick}
  class="relative flex flex-col outline-2 outline-blue-600 w-48 rounded-md overflow-clip {isTimelineElement ? 'h-48' : 'aspect-video'}"
  class:outline={isSelected}
  on:mousedown={handleDragStart}
>
  <slot />
</button>

{#if $studio.dragData === metadata && $mousePos != initialMousePos}
  <div class="z-10 absolute w-6 h-6 rounded-md bg-blue-400 transition-none pointer-events-none" style="top: {$mousePos.y}px; left: {$mousePos.x}px" />
{/if}
