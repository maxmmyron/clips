<script lang="ts">
  import { timeline } from "$lib/stores";

  export let options: Omit<Media, "isSelected">;
  export let zoomScale: number;
  export let idx: number;

  $: isSelected = $timeline.selectedIndex === idx;

  let isDragging = false;
  $: width = (options.duration - options.startOffset - options.endOffset) * zoomScale;

  const handleKey = (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;
    if (!isSelected) return;

    $timeline.clips = $timeline.clips.filter((_, i) => i !== idx);
    $timeline.selectedIndex = -1;
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($timeline.selectedIndex = -1)} />

<button
  style="width: {width}px"
  class="draggable h-24 rounded-md bg-indigo-700 outline-2 outline-blue-600"
  class:dragging={isDragging}
  class:outline={isSelected}
  draggable="true"
  on:click={() => ($timeline.selectedIndex = idx)}
  on:dragstart={() => (isDragging = true)}
  on:dragend={() => (isDragging = false)}
>
  <video src={options.src} class="w-full h-full">
    <track kind="captions" />
  </video>
</button>
