<script lang="ts">
  import { mediaPool, studio } from "$lib/stores";

  let isPlaying = false;
  let isViewingPreview = false;
  let video: HTMLVideoElement | null = null;

  const handleDrop = (e: MouseEvent) => {
    if ($studio.dragData) $mediaPool.previewSrc = $studio.dragData;
  };

  $: isPlaying, video && (isPlaying ? video.play() : video.pause());

  /**
   * Sets video and time and pauses playback.
   */
  const resetVideoTime = (time: number) => {
    if (!video) throw new Error("Video element not found");

    isPlaying = false;
    video.currentTime = time === -1 ? video.duration : time;
  };

  $: previewSrc = $mediaPool.previewSrc;
  $: video?.src, (isPlaying = false);
  $: previewSrc, previewSrc !== null && (isViewingPreview = true);
</script>

<div>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" class:bg-neutral-400={!isViewingPreview} on:click={() => (isViewingPreview = false)}
    >editor</button
  >
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1"
    class:bg-neutral-400={isViewingPreview}
    class:opacity-75={previewSrc === null}
    on:click={() => (isViewingPreview = true)}
    disabled={previewSrc === null}>preview</button
  >
</div>

<video
  class="aspect-video w-100 max-h-[50%] border-2 border-neutral-800"
  bind:this={video}
  src={isViewingPreview ? previewSrc?.src : ""}
  on:mouseup={handleDrop}
>
  <track kind="captions" />
</video>

<p class="text-white">{video?.currentTime}</p>

<div class="w-100 flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => resetVideoTime(0)}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPlaying = !isPlaying)}>{isPlaying ? "⏸️" : "▶️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => resetVideoTime(-1)}>⏩</button>
</div>
