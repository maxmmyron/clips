<script lang="ts">
  import { timeline, studio } from "$lib/stores";
  import MediaPreviewProvider from "./mediaPreview/MediaPreviewProvider.svelte";
  import MediaVideoPreview from "./mediaPreview/MediaVideoPreview.svelte";
  import MediaAudioPreview from "./mediaPreview/MediaAudioPreview.svelte";

  let zoomScale = 5;
  let timelineContainer: HTMLElement;

  let dropIndex: number = -1;

  $: $timeline.zoomScale = zoomScale;

  const handleDragover = (e: MouseEvent) => {
    // gets the next element to insert the dragged element after
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

    if (afterElement == null) {
      dropIndex = -1;
    } else {
      dropIndex = [...timelineContainer.querySelectorAll(".draggable")].indexOf(afterElement);
    }
  };

  const handleDrop = () => {
    if (!$studio.dragData.origin || $studio.dragData.origin === "timeline") {
      const dragEl = timelineContainer.querySelector(".dragging") as HTMLElement;
      console.log(dragEl);
      timelineContainer.removeChild(dragEl);
      if (dropIndex === -1) {
        timelineContainer.appendChild(dragEl);
      } else {
        timelineContainer.insertBefore(dragEl, timelineContainer.children[dropIndex]);
      }
      return;
    }
    $studio.dragData.media && ($timeline.clips = [...$timeline.clips, { ...$studio.dragData.media, startTime: 0, endTime: 0 }]);
    $timeline.dragIndex = -1;
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;

    $timeline.clips = $timeline.clips.filter((clip) => !$timeline.selected.includes(clip));
    $timeline.selected = [];
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($timeline.selected = [])} />

<div class="w-full h-full overflow-x-auto flex" on:mousemove={handleDragover}>
  <div class="w-2/5 h-full bg-neutral-900 border-r-2 border-r-neutral-700 flex-shrink-0" />
  <div class="w-full flex items-center" bind:this={timelineContainer} on:mouseup={handleDrop}>
    {#each $timeline.clips as metadata, idx}
      <div class="draggable" class:dragging={idx === $timeline.dragIndex} class:w-0={idx === $timeline.dragIndex}>
        <MediaPreviewProvider {metadata} store={timeline}>
          <MediaVideoPreview {metadata} isTimelineElement={true} />
          <MediaAudioPreview {metadata} isTimelineElement={true} />
        </MediaPreviewProvider>
      </div>
    {/each}
  </div>
  <input class="absolute top-2 right-2" type="range" min="1" max="10" bind:value={zoomScale} />
</div>
