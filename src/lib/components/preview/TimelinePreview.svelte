<script lang="ts">
  import { player, studio, timeline, draggable, media, secondWidth } from "$lib/stores";
  import Marquee from "../util/Marquee.svelte";

  export let node: App.Node;
  export let selected: string[];
  export let dragIndex: number;

  const metadata = node.metadata;

  let duration = metadata.duration;
  let isAdjustingOffsets = false;
  let mediaPreview: HTMLButtonElement;

  let offsetIndex = -1;
  let initialPosition = 0;
  let initialOffset = 0;

  $: isSelected = selected.includes(node.uuid);

  $: width = (duration - metadata.start - metadata.end) * $secondWidth;

  const handleClick = (e: MouseEvent) => {
    if (isAdjustingOffsets) {
      isAdjustingOffsets = false;
      return;
    }
    if (e.detail == 2) $player.source = node.src;
    else if (e.shiftKey) selected = [...selected, node.uuid];
    else selected = [node.uuid];
  };

  const handleReorder = (e: MouseEvent) => {
    $draggable = {
      ...$draggable,
      media: <App.Media>$media.resolved.find((m) => m.uuid == node.uuid),
      origin: {
        pos: { x: e.clientX, y: e.clientY },
        region: "timeline",
      },
      event: "start",
      region: "timeline",
    };

    $draggable.ghost.pos.set({ x: mediaPreview.getBoundingClientRect().x, y: mediaPreview.getBoundingClientRect().y }, { hard: true });
    $draggable.ghost.size.set({ width: mediaPreview.getBoundingClientRect().width, height: mediaPreview.getBoundingClientRect().height }, { hard: true });

    dragIndex = $timeline.clips.indexOf(node.uuid);
  };

  const handleOffsets = (e: MouseEvent) => {
    if (offsetIndex === -1) return;

    let offset;

    if (offsetIndex == 0) {
      offset = initialOffset + (e.clientX - initialPosition) / $secondWidth;
      metadata.start = Math.max(0, offset);
    } else {
      offset = initialOffset + (initialPosition - e.clientX) / $secondWidth;
      metadata.end = Math.max(0, offset);
    }
  };
</script>

<svelte:window on:mousemove={handleOffsets} on:mouseup={() => (offsetIndex = -1)} />

<button
  bind:this={mediaPreview}
  style="width: {width}px;"
  on:click|capture|stopPropagation={handleClick}
  class="relative flex flex-col outline-2 outline-blue-600 w-48 rounded-md overflow-clip h-24 group"
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
  <div class="flex flex-col w-full h-full">
    <slot {width} />
    <div class="absolute bottom-0 backdrop-blur-md w-full bg-neutral-700/80">
      <Marquee>{metadata.title}</Marquee>
    </div>
  </div>
  <button
    class="z-10 absolute h-full right-0 w-2 bg-emerald-950 opacity-0 cursor-col-resize group-hover:opacity-100"
    on:mousedown|stopPropagation={(e) => {
      offsetIndex = 1;
      initialPosition = mediaPreview.getBoundingClientRect().right;
      initialOffset = metadata.end;
    }}
  />
</button>
