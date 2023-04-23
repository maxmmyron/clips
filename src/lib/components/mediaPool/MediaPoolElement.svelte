<script lang="ts">
  import { media, timeline } from "$lib/stores";

  export let src: string;
  export let idx: number;

  let duration: number = 0;

  $: isSelected = $media.selected.includes(idx);

  const handleClick = (e: MouseEvent) => {
    console.log("click");
    if (e.detail === 2) $media.previewSource = src;
    else {
      if (e.shiftKey) $media.selected = [...$media.selected, idx];
      else $media.selected = [idx];
    }
  };

  const addToTimeline = () => {
    console.log("timeline");
    $timeline.clips = [...$timeline.clips, { duration, src, startOffset: 0, endOffset: 0 }];
  };
</script>

<button on:click|stopPropagation={handleClick} class="relative outline-2 outline-blue-600" class:outline={isSelected}>
  {#if isSelected}
    <button class="absolute top-2 left-8 w-5 h-5 bg-neutral-700" on:click|capture|stopPropagation={addToTimeline}>🎞️</button>
  {/if}
  <video bind:duration>
    <source {src} type="video/mp4" />
    <track kind="captions" />
  </video>
</button>
