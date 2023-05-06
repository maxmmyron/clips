<script lang="ts">
  import { player, studio, timeline } from "$lib/stores";

  export let metadata: TimelineMedia;

  let duration = metadata.duration;
  let width = (duration - metadata.startTime - metadata.endTime) * $timeline.zoomScale + "px";
  let mediaPreview: HTMLButtonElement;

  $: isSelected = $timeline.selected.includes(metadata);

  const handleClick = (e: MouseEvent) => {
    if (e.detail == 2) $player.source = metadata.src;
    else if (e.shiftKey) $timeline.selected = [...$timeline.selected, metadata];
    else $timeline.selected = [metadata];
  };

  const handleDragStart = (e: MouseEvent) => {
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
</script>

<button
  bind:this={mediaPreview}
  style="width: {width};"
  on:click|capture|stopPropagation={handleClick}
  class="relative flex flex-col outline-2 outline-blue-600 w-48 rounded-md overflow-clip h-48"
  class:outline={isSelected}
  on:mousedown={handleDragStart}
>
  <slot />
</button>
