<script lang="ts">
  import { timeline, studio } from "$lib/stores";
  import MediaPreviewProvider from "../MediaPreviewProvider.svelte";
  import MediaVideoPreview from "../MediaVideoPreview.svelte";
  import MediaAudioPreview from "../MediaAudioPreview.svelte";

  let zoomScale = 5;
  let timelineContainer: HTMLElement;

  $: $timeline.zoomScale = zoomScale;

  const handleDragover = (e: DragEvent) => {
    e.preventDefault();

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

    const draggable = timelineContainer.querySelector(".dragging") as HTMLElement;

    if (!draggable) return;

    if (afterElement == null) {
      timelineContainer.appendChild(draggable);
    } else {
      timelineContainer.insertBefore(draggable, afterElement);
    }
  };

  const handleDrop = () => $studio.dragData && ($timeline.clips = [...$timeline.clips, { ...$studio.dragData, startTime: 0, endTime: 0 }]);

  const handleKey = (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;

    $timeline.clips = $timeline.clips.filter((clip) => !$timeline.selected.includes(clip));
    $timeline.selected = [];
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($timeline.selected = [])} />

<div class="w-full h-full overflow-x-auto flex relative" on:dragover={handleDragover}>
  <div class="w-2/5 h-full bg-neutral-900 border-r-2 border-r-neutral-700 flex-shrink-0" />
  <div class="w-full flex items-center" bind:this={timelineContainer} on:mouseup={handleDrop}>
    {#each $timeline.clips as metadata, idx}
      <MediaPreviewProvider {metadata} store={timeline}>
        <MediaVideoPreview {metadata} />
        <MediaAudioPreview {metadata} />
      </MediaPreviewProvider>
    {/each}
  </div>
  <input class="absolute top-2 right-2" type="range" min="1" max="10" bind:value={zoomScale} />
</div>
