<script lang="ts">
  import { media, timeline } from "$lib/stores";

  export let src: string;
  export let idx: number;

  let duration: number = 0;

  $: isSelected = $media.selected.includes(idx);

  const handleClick = (e: MouseEvent) => {
    if (e.detail === 2) $media.previewSource = src;
    else if (e.shiftKey) $media.selected = [...$media.selected, idx];
    else $media.selected = [idx];
  };

  const addToTimeline = () => ($timeline.clips = [...$timeline.clips, { duration, src, startOffset: 0, endOffset: 0 }]);
</script>

<button
  on:click|stopPropagation={handleClick}
  class="relative outline-2 outline-blue-600 aspect-video w-48 bg-black rounded-md overflow-clip"
  class:outline={isSelected}
>
  {#if isSelected}<button class="absolute top-3 left-3" on:click|capture|stopPropagation={addToTimeline}>⬆️</button>{/if}
  <video class="w-full h-full object-contain" bind:duration>
    <source {src} type="video/mp4" />
    <track kind="captions" />
  </video>
</button>
