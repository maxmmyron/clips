<script lang="ts">
  import { timeline } from "$lib/stores";
  import { onMount } from "svelte";
  import LoadIcon from "../LoadIcon.svelte";

  export let src: string;
  export let zoomScale: number;

  let thumbnail: string | null = null;

  onMount(() => {
    if ($timeline.thumbnails.has(src)) {
      thumbnail = $timeline.thumbnails.get(src) as string;
      return;
    }

    const canvasEl = document.createElement("canvas");
    const ctx = canvasEl.getContext("2d") as CanvasRenderingContext2D;

    const videoEl = document.createElement("video");
    videoEl.src = src;

    videoEl.addEventListener("loadeddata", () => {
      // load video thumbnail
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

      canvasEl.toBlob((blob) => {
        if (!blob) return console.error("Could not create thumbnail");
        thumbnail = URL.createObjectURL(blob);
        $timeline.thumbnails.set(src, thumbnail);
      });
    });
  });
</script>

<div class="h-24 bg-neutral-700 border-2 border-neutral-600 rounded-lg overflow-clip">
  {#if thumbnail}
    <div class="w-full h-full bg-repeat-x" style="background-image: url({thumbnail}); background-size: auto 100%;" />
  {:else}
    <div class="w-full h-full flex justify-center items-center">
      <LoadIcon />
    </div>
  {/if}
</div>
