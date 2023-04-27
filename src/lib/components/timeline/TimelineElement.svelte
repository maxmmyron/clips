<script lang="ts">
  import TimelineAudioComponent from "./TimelineAudioComponent.svelte";
  import TimelineVideoComponent from "./TimelineVideoComponent.svelte";
  import { timeline } from "$lib/stores";

  export let options: Omit<Media, "isSelected">;
  export let zoomScale: number;
  export let idx: number;

  let isDragging = false;

  $: isSelected = $timeline.selected.includes(idx);
  $: width = (options.duration - options.startOffset - options.endOffset) * zoomScale;

  const handleSelect = (e: MouseEvent) => {
    if (e.shiftKey) $timeline.selected = [...$timeline.selected, idx];
    else $timeline.selected = [idx];
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events TODO: remove this line! -->
<div
  style="width: {width}px;"
  class="draggable flex flex-col rounded-lg outline-2 outline-blue-600 overflow-clip"
  on:click|capture|stopPropagation={handleSelect}
  class:outline={isSelected}
  class:draggable={isDragging}
  draggable="true"
  on:dragstart={() => (isDragging = true)}
  on:dragend={() => (isDragging = false)}
>
  <TimelineVideoComponent src={options.src} {zoomScale} />
  <TimelineAudioComponent {options} {zoomScale} />
</div>
