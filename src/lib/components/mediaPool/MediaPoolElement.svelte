<script lang="ts">
  import { media, timeline } from "$lib/stores";

  export let src: string;
  export let idx: number;

  let duration: number = 0;

  const handleClick = (e: MouseEvent) => {
    if (e.detail === 2) $media.previewIndex = idx;
    else {
      $media.files[idx].isSelected = !$media.files[idx].isSelected;
      $media.isAnySelected = $media.files.some((file) => file.isSelected);
    }
  };

  const addToTimeline = () => {
    timeline.update((timeline) => {
      timeline.push({
        duration,
        src,
        startOffset: 0,
        endOffset: 0,
      });
      return timeline;
    });
  };
</script>

<button on:click={handleClick} class="relative outline-2 outline-yellow-300" class:outline={$media.files[idx].isSelected}>
  {#if $media.isAnySelected}
    <input type="checkbox" class="absolute top-2 left-2 shadow-md pointer-events-none" checked={$media.files[idx].isSelected} tabindex="-1" />
  {/if}
  {#if $media.files[idx].isSelected}
    <button class="absolute top-2 left-8 w-5 h-5 bg-neutral-700" on:click={addToTimeline}>🎞️</button>
  {/if}
  <video bind:duration>
    <source {src} type="video/mp4" />
    <track kind="captions" />
  </video>
</button>
