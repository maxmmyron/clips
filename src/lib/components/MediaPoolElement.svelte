<script lang="ts">
  import { mediaStore } from "../stores";
  export let src: string;
  export let idx: number;

  const handlePreview = () => {
    mediaStore.update((store) => {
      store.previewIndex = idx;
      return store;
    });
  };
</script>

<button on:dblclick={handlePreview}>
  <video>
    <source {src} type="video/mp4" />
    <track kind="captions" />
  </video>
</button>
