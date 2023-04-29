<script lang="ts">
  import { mediaPool, studio, timeline } from "$lib/stores";

  export let metadata: StudioMediaMetadata;
  export let store: WritableMediaPool | WritableTimeline;

  let duration = -1;
  metadata.duration.then((dur) => (duration = dur));

  let width = "12rem";

  $: isTimelineElement = store === timeline;

  $: duration !== -1 && (width = isTimelineElement ? (duration - metadata.startTime - metadata.endTime) * $timeline.zoomScale + "px" : "12rem");

  let mediaPreview: HTMLButtonElement;

  $: isSelected = $store.selected.includes(metadata);

  const handleClick = (e: MouseEvent) => {
    if (e.detail == 2) $mediaPool.previewSrc = metadata;
    else if (e.shiftKey) $store.selected = [...$store.selected, metadata];
    else $store.selected = [metadata];
  };

  const handleDragStart = (e: MouseEvent) => {
    $studio.dragData = {
      ...$studio.dragData,
      media: metadata,
      originType: isTimelineElement ? "timeline" : "mediaPool",
      originPosition: { x: e.clientX, y: e.clientY },
      dragEvent: "dragstart",
      currentDragRegion: isTimelineElement ? "timeline" : null,
    };

    $studio.dragData.ghost.position.set({ x: mediaPreview.getBoundingClientRect().x, y: mediaPreview.getBoundingClientRect().y }, { hard: true });
    $studio.dragData.ghost.size.set({ width: mediaPreview.getBoundingClientRect().width, height: mediaPreview.getBoundingClientRect().height }, { hard: true });

    isTimelineElement && ($timeline.dragIndex = $timeline.clips.indexOf(metadata));
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
