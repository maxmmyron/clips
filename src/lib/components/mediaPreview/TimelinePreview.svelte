<script lang="ts">
  import { player, studio, timeline } from "$lib/stores";

  export let metadata: TimelineMedia;

  let duration = metadata.duration;
  let isAdjustingOffsets = false;
  let mediaPreview: HTMLButtonElement;

  let isAdjustingOffset = false;
  let offsetIndex = 0;

  $: isSelected = $timeline.selected.includes(metadata);
  $: width = (duration - metadata.startTime - metadata.endTime) * $timeline.zoomScale ** 1.75 + "px";

  const handleClick = (e: MouseEvent) => {
    if (isAdjustingOffsets) {
      isAdjustingOffsets = false;
      return;
    }
    if (e.detail == 2) $player.source = metadata.src;
    else if (e.shiftKey) $timeline.selected = [...$timeline.selected, metadata];
    else $timeline.selected = [metadata];
  };

  const handleReorder = (e: MouseEvent) => {
    $studio.dragData = {
      ...$studio.dragData,
      media: metadata,
      originType: "timeline",
      originPosition: { x: e.clientX, y: e.clientY },
      dragEvent: "dragstart",
      currentDragRegion: "timeline",
    };

    $studio.dragData.ghost.position.set({ x: mediaPreview.getBoundingClientRect().x, y: mediaPreview.getBoundingClientRect().y }, { hard: true });
    $studio.dragData.ghost.size.set({ width: mediaPreview.getBoundingClientRect().width, height: mediaPreview.getBoundingClientRect().height }, { hard: true });

    $timeline.dragIndex = $timeline.clips.indexOf(metadata);
  };

  const handleOffsets = (e: MouseEvent) => {
    if (!isAdjustingOffsets) return;
    const offset = e.clientX - mediaPreview.getBoundingClientRect().left;
    if (offsetIndex == 0) {
      metadata.startTime = Math.max(0, Math.min(metadata.endTime, offset / $timeline.zoomScale ** 1.75));
    } else {
      metadata.endTime = Math.max(metadata.startTime, offset / $timeline.zoomScale ** 1.75);
    }
  };
</script>

<svelte:window
  on:mousemove={handleOffsets}
  on:mouseup={() => {
    isAdjustingOffsets = false;
  }}
/>

<button
  bind:this={mediaPreview}
  style="width: {width};"
  on:click|capture|stopPropagation={handleClick}
  class="relative flex flex-col outline-2 outline-blue-600 w-48 rounded-md overflow-clip h-48 bg-black group"
  class:outline={isSelected}
  on:mousedown={handleReorder}
>
  <button
    class="z-10 absolute h-full left-0 w-2 bg-emerald-950 opacity-0 cursor-col-resize group-hover:opacity-100"
    on:mousedown|stopPropagation={(e) => {
      isAdjustingOffsets = true;
      offsetIndex = 0;
    }}
  />
  <slot />
  <button
    class="z-10 absolute h-full right-0 w-2 bg-emerald-950 opacity-0 cursor-col-resize group-hover:opacity-100"
    on:mousedown|stopPropagation={(e) => {
      isAdjustingOffsets = true;
      offsetIndex = 1;
    }}
  />
</button>
