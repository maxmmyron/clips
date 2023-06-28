<script lang="ts">
  import { player, studio, timeline } from "$lib/stores";

  export let node: App.Node;
  export let timelineSecondWidth: number;

  const metadata = node.metadata;

  let duration = metadata.duration;
  let isAdjustingOffsets = false;
  let mediaPreview: HTMLButtonElement;

  let offsetIndex = -1;
  let initialPosition = 0;
  let initialOffset = 0;

  $: isSelected = $timeline.selected.includes(node.uuid);

  // n such that 2^n = duration of a 20% segment of the timeline.
  $: secondScale = 2 ** (5 - $timeline.zoomScale);

  $: width = ((duration - metadata.start - metadata.end) / secondScale) * timelineSecondWidth;

  const handleClick = (e: MouseEvent) => {
    if (isAdjustingOffsets) {
      isAdjustingOffsets = false;
      return;
    }
    if (e.detail == 2) $player.source = node.src;
    else if (e.shiftKey) $timeline.selected = [...$timeline.selected, node.uuid];
    else $timeline.selected = [node.uuid];
  };

  const handleReorder = (e: MouseEvent) => {
    $studio.draggable = {
      ...$studio.draggable,
      mediaUUID: node.mediaUUID,
      origin: {
        pos: { x: e.clientX, y: e.clientY },
        region: "timeline",
      },
      event: "start",
      current: {
        region: "timeline",
      },
    };

    $studio.draggable.ghost.pos.set({ x: mediaPreview.getBoundingClientRect().x, y: mediaPreview.getBoundingClientRect().y }, { hard: true });
    $studio.draggable.ghost.size.set(
      { width: mediaPreview.getBoundingClientRect().width, height: mediaPreview.getBoundingClientRect().height },
      { hard: true }
    );

    $timeline.dragIndex = $timeline.timeline.indexOf(node.uuid);
  };

  const handleOffsets = (e: MouseEvent) => {
    if (offsetIndex === -1) return;

    let offset;

    if (offsetIndex == 0) {
      offset = initialOffset + (e.clientX - initialPosition) / $timeline.zoomScale;
      metadata.start = Math.max(0, offset);
    } else {
      offset = initialOffset + (initialPosition - e.clientX) / $timeline.zoomScale;
      metadata.end = Math.max(0, offset);
    }
  };
</script>

<svelte:window on:mousemove={handleOffsets} on:mouseup={() => (offsetIndex = -1)} />

<button
  bind:this={mediaPreview}
  style="width: {width}px;"
  on:click|capture|stopPropagation={handleClick}
  class="relative flex flex-col outline-2 outline-blue-600 w-48 rounded-md overflow-clip h-48 bg-black group"
  class:outline={isSelected}
  on:mousedown|stopPropagation={handleReorder}
>
  <button
    class="z-10 absolute h-full left-0 w-2 bg-emerald-950 opacity-0 cursor-col-resize group-hover:opacity-100"
    on:mousedown|stopPropagation={(e) => {
      offsetIndex = 0;
      initialPosition = mediaPreview.getBoundingClientRect().left;
      initialOffset = metadata.start;
    }}
  />
  <slot {width} />
  <button
    class="z-10 absolute h-full right-0 w-2 bg-emerald-950 opacity-0 cursor-col-resize group-hover:opacity-100"
    on:mousedown|stopPropagation={(e) => {
      offsetIndex = 1;
      initialPosition = mediaPreview.getBoundingClientRect().right;
      initialOffset = metadata.end;
    }}
  />
</button>
