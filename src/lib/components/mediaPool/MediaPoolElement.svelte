<script lang="ts">
  import { media } from "$lib/stores";

  export let src: string;
  export let idx: number;

  const handleClick = (e: MouseEvent) => {
    if (e.detail === 2) $media.previewIndex = idx;
    else {
      $media.files[idx].isSelected = !$media.files[idx].isSelected;
      $media.isAnySelected = $media.files.some((file) => file.isSelected);
    }
  };
</script>

<button on:click={handleClick} class="relative outline-2 outline-yellow-300" class:outline={$media.files[idx].isSelected}>
  {#if $media.isAnySelected}
    <input type="checkbox" class="absolute top-2 left-2 shadow-md pointer-events-none" checked={$media.files[idx].isSelected} tabindex="-1" />
  {/if}
  <video>
    <source {src} type="video/mp4" />
    <track kind="captions" />
  </video>
</button>
