<script lang="ts">
  import { timeline, studio } from "$lib/stores";
  import TimelineElement from "./TimelineElement.svelte";

  let zoomScale = 5;
  let timelineContainer: HTMLElement;

  const handleDragover = (e: DragEvent) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(e.clientX);
    const draggable = timelineContainer.querySelector(".dragging") as HTMLElement;

    if (!draggable) return;

    if (afterElement == null) {
      timelineContainer.appendChild(draggable);
    } else {
      timelineContainer.insertBefore(draggable, afterElement);
    }
  };

  const getDragAfterElement = (x: number) => {
    const draggableElements = [...timelineContainer.querySelectorAll(".draggable:not(.dragging)")];

    return draggableElements.reduce(
      (accumulator, currChild) => {
        const childBounds = currChild.getBoundingClientRect();
        const offset = x - childBounds.left - childBounds.width / 2;
        if (offset < 0 && offset > accumulator.offset) {
          return { offset, el: currChild };
        } else {
          return { offset: accumulator.offset, el: accumulator.el };
        }
      },
      { el: null as Element | null, offset: Number.NEGATIVE_INFINITY }
    ).el;
  };

  const handleDrop = () => $studio.dragData && ($timeline.clips = [...$timeline.clips, { ...$studio.dragData, startOffset: 0, endOffset: 0 }]);

  const handleKey = (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;

    $timeline.clips = $timeline.clips.filter((_, i) => !$timeline.selected.includes(i));
    $timeline.selected = [];
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($timeline.selected = [])} />

<div class="w-full h-full overflow-x-auto flex relative" on:dragover={handleDragover}>
  <div class="w-2/5 h-full bg-neutral-900 border-r-2 border-r-neutral-700 flex-shrink-0" />
  <div class="w-full flex items-center" bind:this={timelineContainer} on:mouseup={handleDrop}>
    {#each $timeline.clips as options, idx}
      <TimelineElement {options} {zoomScale} {idx} />
    {/each}
  </div>
  <input class="absolute top-2 right-2" type="range" min="1" max="10" bind:value={zoomScale} />
</div>
