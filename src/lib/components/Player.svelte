<script lang="ts">
  import { mediaPool, studio } from "$lib/stores";

  let isPlaying = false;
  let isViewingPreview = false;
  let video: HTMLVideoElement | null = null;
  let currentTime = 0;

  const handleDrag = () => {
    if (!$studio.dragData || $studio.dragData.dragEvent !== "drag" || !video) return;

    $studio.dragData.ghost.position.set({ x: video.getBoundingClientRect().x, y: video.getBoundingClientRect().y });
    $studio.dragData.ghost.size.set({ width: video.getBoundingClientRect().width, height: video.getBoundingClientRect().height });
  };

  const handleDrop = (e: MouseEvent) => {
    if ($studio.dragData) $mediaPool.previewSrc = $studio.dragData.media;
  };

  $: isPlaying, video && (isPlaying ? video.play() : video.pause());

  /**
   * Sets video and time and pauses playback.
   */
  const resetVideoTime = (time: number) => {
    if (!video) throw new Error("Video element not found");

    isPlaying = false;
    currentTime = time === -1 ? video.duration : time;
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
  bind:currentTime
  on:mouseup={handleDrop}
  on:mousemove={handleDrag}
  on:mouseenter={() => ($studio.dragData.currentDragRegion = "player")}
  on:mouseleave={() => ($studio.dragData.currentDragRegion = null)}
>
  <track kind="captions" />
</video>

<p class="w-full text-white text-right">{currentTime.toPrecision(2)}</p>

<div class="w-100 flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => resetVideoTime(0)}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPlaying = !isPlaying)}>{isPlaying ? "⏸️" : "▶️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => resetVideoTime(-1)}>⏩</button>
</div>
