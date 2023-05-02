<script lang="ts">
  import { mediaPool, studio, player } from "$lib/stores";
  import EditorPlayer from "./EditorPlayer.svelte";
  import PreviewPlayer from "./PreviewPlayer.svelte";

  let isPlaying = false;
  let video: HTMLVideoElement | null = null;
  let videoContainer: HTMLDivElement | null = null;
  let currentTime = 0;

  const handleDrag = () => {
    if (!$studio.dragData || $studio.dragData.dragEvent !== "drag" || !videoContainer) return;

    $studio.dragData.ghost.position.set({ x: videoContainer.getBoundingClientRect().x, y: videoContainer.getBoundingClientRect().y });
    $studio.dragData.ghost.size.set({ width: videoContainer.getBoundingClientRect().width, height: videoContainer.getBoundingClientRect().height });
  };

  const handleDrop = (e: MouseEvent) => {
    if ($studio.dragData) $player.sourceMetadata = $studio.dragData.media;
  };

  /**
   * Sets video and time and pauses playback.
   */
  const resetVideoTime = (time: number) => {
    $player.isPlaying = false;
    $player.sourceMetadata?.duration.then((duration) => {
      $player.currentTime = time === -1 ? duration : time;
    });
  };

  $: isViewingPreview = $player.playerState === "preview";
  $: previewSrc = $player.sourceMetadata;
  $: video?.src, (isPlaying = false);
</script>

<div>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" class:bg-neutral-400={!isViewingPreview} on:click={() => (isViewingPreview = false)}
    >editor</button
  >
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1"
    class:bg-neutral-400={isViewingPreview}
    class:opacity-75={previewSrc === null}
    on:click={() => ($player.playerState = "preview")}
    disabled={previewSrc === null}>preview</button
  >
</div>

<div
  class="aspect-video w-100 max-h-[50%] border-2 border-neutral-800"
  bind:this={videoContainer}
  on:mouseup={handleDrop}
  on:mousemove={handleDrag}
  on:mouseenter={() => ($studio.dragData.currentDragRegion = "player")}
  on:mouseleave={() => ($studio.dragData.currentDragRegion = null)}
>
  {#if $player.playerState === "editor"}
    <EditorPlayer />
  {:else if $player.playerState === "preview"}
    <PreviewPlayer />
  {/if}
</div>

<p class="w-full text-white text-right">{currentTime.toPrecision(2)}</p>

<div class="w-100 flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => resetVideoTime(0)}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => ($player.isPlaying = !$player.isPlaying)}
    >{$player.isPlaying ? "⏸️" : "▶️"}</button
  >
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => resetVideoTime(-1)}>⏩</button>
</div>
