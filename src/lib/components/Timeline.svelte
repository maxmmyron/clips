<script lang="ts">
  import { timeline, studio } from "$lib/stores";
  import { v4 as uuidv4 } from "uuid";
  import MediaVideoPreview from "./mediaPreview/MediaVideoPreview.svelte";
  import MediaAudioPreview from "./mediaPreview/MediaAudioPreview.svelte";
  import TimelinePreview from "./mediaPreview/TimelinePreview.svelte";

  let zoomScale = 5;
  let timelineContainer: HTMLElement;

  let dropIndex: number = -1;

  $: $timeline.zoomScale = zoomScale;

  const handleDrag = (e: MouseEvent) => {
    if ($studio.dragData.dragEvent !== "drag" || $studio.dragData.currentDragRegion !== "timeline") return;

    // get the element to place our element before
    const afterElement = [...timelineContainer.querySelectorAll(".draggable:not(.dragging)")].reduce(
      (accumulator, currChild) => {
        const childBounds = currChild.getBoundingClientRect();
        const offset = e.clientX - childBounds.left - childBounds.width / 2;
        if (offset < 0 && offset > accumulator.offset) {
          return { offset, el: currChild };
        } else {
          return { offset: accumulator.offset, el: accumulator.el };
        }
      },
      { el: null as Element | null, offset: Number.NEGATIVE_INFINITY }
    ).el;

    // get nearest spot to position ghost
    let dropXPosition = -1;
    if (afterElement == null) {
      dropIndex = -1;
      if (timelineContainer.children.length > 0)
        dropXPosition = timelineContainer.children[timelineContainer.children.length - 1].getBoundingClientRect().right;
      else dropXPosition = timelineContainer.getBoundingClientRect().left;
    } else {
      dropIndex = [...timelineContainer.querySelectorAll(".draggable:not(.dragging)")].indexOf(afterElement);
      dropXPosition = afterElement.getBoundingClientRect().left;
    }

    // update ghost position and size
    $studio.dragData.ghost.position.set({
      x: dropXPosition,
      y: timelineContainer.getBoundingClientRect().top,
    });
    $studio.dragData.ghost.size.set({ width: 8, height: timelineContainer.getBoundingClientRect().height });
  };

  const handleDragEnd = () => {
    if ($studio.dragData.dragEvent === "dragstart") return;
    if ($studio.dragData.originType === "timeline") {
      if ($timeline.dragIndex === -1) return;

      const media = $timeline.clips.splice($timeline.dragIndex, 1)[0];

      if (dropIndex === -1) $timeline.clips.push(media);
      else $timeline.clips.splice(dropIndex, 0, media);
      return;
    }
    // handle dragging new media into timeline
    $studio.dragData.media && ($timeline.clips = [...$timeline.clips, { uuid: uuidv4(), ...$studio.dragData.media, startTime: 0, endTime: 0 }]);
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;

    const deleteIDs = $timeline.selected.map((clip) => clip.uuid);
    $timeline.clips = $timeline.clips.filter((clip) => !deleteIDs.includes(clip.uuid));
    $timeline.buffers = $timeline.buffers.filter((buffer) => !deleteIDs.includes(buffer.metadata.uuid));

    $timeline.selected = [];
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($timeline.selected = [])} />

<div class="relative w-full h-full overflow-x-auto flex items-center" on:mousemove={handleDrag}>
  <div class="w-2/5 h-full bg-neutral-900 border-r-2 border-r-neutral-700 flex-shrink-0" />
  <div
    class="w-full h-full flex items-center"
    on:mouseup={handleDragEnd}
    on:mouseenter={() => ($studio.dragData.currentDragRegion = "timeline")}
    on:mouseleave={() => ($studio.dragData.currentDragRegion = null)}
  >
    <div class="flex h-fit min-h-[50%]" bind:this={timelineContainer}>
      {#each $timeline.clips as metadata, idx (metadata.uuid)}
        <div
          class="draggable overflow-clip"
          class:dragging={idx === $timeline.dragIndex && $studio.dragData.dragEvent === "drag"}
          class:w-0={idx === $timeline.dragIndex && $studio.dragData.dragEvent === "drag"}
        >
          <TimelinePreview {metadata}>
            <MediaVideoPreview metadata={{ name: metadata.name, thumbnails: metadata.thumbnails }} isTimelineElement={true} />
            <MediaAudioPreview {metadata} />
          </TimelinePreview>
        </div>
      {/each}
    </div>
  </div>
  <input class="absolute top-2 right-2" type="range" min="1" max="10" bind:value={zoomScale} />
</div>
