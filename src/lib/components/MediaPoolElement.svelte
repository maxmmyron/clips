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

<button on:click={handleClick} class="outline-2 outline-red-200" class:outline={$mediaStore.media[idx].isSelected}>
  {#if $mediaStore.isAnySelected}
    <input type="checkbox" checked={$mediaStore.media[idx].isSelected} />
  {/if}
  <video>
    <source {src} type="video/mp4" />
    <track kind="captions" />
  </video>
</button>
