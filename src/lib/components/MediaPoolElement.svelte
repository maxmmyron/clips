<script lang="ts">
  import { mediaStore } from "../stores";

  export let src: string;
  export let idx: number;

  let isAnyMediaElementSelected = false;

  mediaStore.subscribe((store) => {
    isAnyMediaElementSelected = store.media.some((media) => media.isSelected);
  });

  const handleClick = (e: MouseEvent) => {
    if (e.detail === 2) {
      mediaStore.update((store) => {
        store.previewIndex = idx;
        return store;
      });
    } else {
      mediaStore.update((store) => {
        store.media[idx].isSelected = !store.media[idx].isSelected;
        return store;
      });
    }
  };
</script>

<button on:click={handleClick} class="outline-2 outline-red-200" class:outline={$mediaStore.media[idx].isSelected}>
  {#if isAnyMediaElementSelected}
    <input type="checkbox" checked={$mediaStore.media[idx].isSelected} />
  {/if}
  <video>
    <source {src} type="video/mp4" />
    <track kind="captions" />
  </video>
</button>
