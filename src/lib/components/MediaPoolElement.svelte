<script lang="ts">
  import { mediaStore } from "../stores";

  export let src: string;
  export let idx: number;

  const handleClick = (e: MouseEvent) => {
    if (e.detail === 2) {
      mediaStore.update((store) => {
        store.previewIndex = idx;
        return store;
      });
    } else {
      mediaStore.update((store) => {
        store.media[idx].isSelected = !store.media[idx].isSelected;
        store.isAnySelected = store.media.some((media) => media.isSelected);
        return store;
      });
    }
  };
</script>

<button on:click={handleClick} class="relative outline-2 outline-yellow-300" class:outline={$mediaStore.media[idx].isSelected}>
  {#if $mediaStore.isAnySelected}
    <input type="checkbox" class="absolute top-2 left-2 shadow-md pointer-events-none" checked={$mediaStore.media[idx].isSelected} tabindex="-1" />
  {/if}
  <video>
    <source {src} type="video/mp4" />
    <track kind="captions" />
  </video>
</button>
