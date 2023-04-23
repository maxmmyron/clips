<script lang="ts">
  import { timeline } from "$lib/stores";
  import Layout from "../../../routes/+layout.svelte";
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
</script>

<div class="w-full h-full overflow-x-auto flex" on:dragover={handleDragover}>
  <div class="w-2/5 h-full bg-neutral-900 border-r-2 border-r-neutral-700 flex-shrink-0" />
  <div class="flex items-center" bind:this={timelineContainer}>
    {#each $timeline.clips as options, idx}
      <TimelineElement {options} {zoomScale} {idx} />
    {/each}
  </div>
</div>
