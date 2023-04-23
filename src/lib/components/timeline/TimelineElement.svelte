<script lang="ts">
  import { timeline } from "$lib/stores";

  export let options: Omit<Media, "isSelected">;
  export let zoomScale: number;
  export let idx: number;

  $: isSelected = $timeline.selected.includes(idx);

  let isDragging = false;
  $: width = (options.duration - options.startOffset - options.endOffset) * zoomScale;

  const handleClick = (e: MouseEvent) => {
    if (e.shiftKey) $timeline.selected = [...$timeline.selected, idx];
    else $timeline.selected = [idx];
  };
</script>

<button
  style="width: {width}px"
  class="draggable h-24 rounded-md bg-indigo-700 outline-2 outline-blue-600"
  class:dragging={isDragging}
  class:outline={isSelected}
  draggable="true"
  on:click|capture|stopPropagation={handleClick}
  on:dragstart={() => (isDragging = true)}
  on:dragend={() => (isDragging = false)}
>
  <video src={options.src} class="w-full h-full">
    <track kind="captions" />
  </video>
</button>
