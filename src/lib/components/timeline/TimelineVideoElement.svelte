<script lang="ts">
  import { timeline } from "$lib/stores";
  import { onMount } from "svelte";
  import LoadIcon from "../LoadIcon.svelte";

  export let options: Omit<Media, "isSelected">;
  export let zoomScale: number;
  export let idx: number;

  $: isSelected = $timeline.selected.includes(idx);

  let thumbnail: string | null;
  let isDragging = false;

  $: width = (options.duration - options.startOffset - options.endOffset) * zoomScale;

  onMount(() => {
    if ($timeline.thumbnails.has(options.src)) {
      thumbnail = $timeline.thumbnails.get(options.src) as string;
      return;
    }

    const canvasEl = document.createElement("canvas");
    const ctx = canvasEl.getContext("2d");

    const videoEl = document.createElement("video");
    videoEl.src = options.src;

    videoEl.addEventListener("loadeddata", () => {
      if (!ctx) return;
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;

      ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

      ctx.canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Failed to create blob");
          return;
        }
        thumbnail = URL.createObjectURL(blob);
        $timeline.thumbnails.set(options.src, thumbnail);
      });
    });
  });

  const handleClick = (e: MouseEvent) => {
    if (e.shiftKey) $timeline.selected = [...$timeline.selected, idx];
    else $timeline.selected = [idx];
  };
</script>

<button
  style="width: {width}px;"
  class="draggable h-24 flex justify-center items-center bg-neutral-700 border-2 border-neutral-600 rounded-lg outline-2 outline-neutral-500 overflow-clip"
  class:dragging={isDragging}
  class:outline={isSelected}
  draggable="true"
  on:click|capture|stopPropagation={handleClick}
  on:dragstart={() => (isDragging = true)}
  on:dragend={() => (isDragging = false)}
>
  {#if thumbnail}
    <div class="w-full h-full bg-repeat-x" style="background-image: url({thumbnail}); background-size: auto 100%;" />
  {:else}
    <LoadIcon />
  {/if}
</button>
