<script lang="ts">
  import { player, studio, timeline } from "$lib/stores";

  export let node: TimelineLayerNode<TimelineVideo | TimelineAudio | TimelineImage>;

  const metadata = node.metadata;

  let duration = metadata.duration;
  let isAdjustingOffsets = false;
  let mediaPreview: HTMLButtonElement;

  let offsetIndex = -1;
  let initialPosition = 0;
  let initialOffset = 0;

  $: isSelected = $timeline.selected.includes(node);
  // duration factor
  $: scaleFactor = $timeline.zoom ** 1.75;
  $: width = (duration - metadata.offsets[0] - metadata.offsets[1]) * scaleFactor + "px";

  const handleClick = (e: MouseEvent) => {
    if (isAdjustingOffsets) {
      isAdjustingOffsets = false;
      return;
    }
    if (e.detail == 2) $player.source = metadata.src;
    else if (e.shiftKey) $timeline.selected = [...$timeline.selected, node];
    else $timeline.selected = [node];
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

    $timeline.dragIndex = $timeline.clips.indexOf(node.uuid);
  };

  const handleOffsets = (e: MouseEvent) => {
    if (offsetIndex === -1) return;

    let offset;

    if (offsetIndex == 0) {
      offset = initialOffset + (e.clientX - initialPosition) / scaleFactor;
      metadata.offsets[0] = Math.max(0, offset);
    } else {
      offset = initialOffset + (initialPosition - e.clientX) / scaleFactor;
      metadata.offsets[1] = Math.max(0, offset);
    }
  };
</script>

<svelte:window on:mousemove={handleOffsets} on:mouseup={() => (offsetIndex = -1)} />

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
      offsetIndex = 0;
      initialPosition = mediaPreview.getBoundingClientRect().left;
      initialOffset = metadata.offsets[0];
    }}
  />
  <slot {width} />
  <button
    class="z-10 absolute h-full right-0 w-2 bg-emerald-950 opacity-0 cursor-col-resize group-hover:opacity-100"
    on:mousedown|stopPropagation={(e) => {
      offsetIndex = 1;
      initialPosition = mediaPreview.getBoundingClientRect().right;
      initialOffset = metadata.offsets[1];
    }}
  />
</button>
