<script lang="ts">
  import { mediaStore } from "../stores";

  let isPlaying = false;
  let isViewingPreview = false;

  let previewVideo: HTMLVideoElement | null = null;
  let editorVideo: HTMLVideoElement | null = null;

  $: currentVideo = isViewingPreview ? previewVideo : editorVideo;

  $: currentVideo && (isPlaying ? currentVideo?.play() : currentVideo?.pause());

  /**
   * Sets video and time and pauses playback.
   */
  const resetVideoTime = (time: number) => {
    if (!currentVideo) throw new Error("Video element not found");

    isPlaying = false;
    currentVideo.currentTime = time === -1 ? currentVideo.duration : time;
  };

  $: previewSrc = $mediaStore.media[$mediaStore.previewIndex || 0]?.src || "";
  // probably the hackiest possible solution to the "pause player when switching media" problem
  $: previewSrc, previewVideo && (isPlaying = false);
  $: previewSrc, (isViewingPreview = true);
</script>

<div>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" class:bg-neutral-400={!isViewingPreview} on:click={() => (isViewingPreview = false)}
    >editor</button
  >
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1"
    class:bg-neutral-400={isViewingPreview}
    class:opacity-75={$mediaStore.previewIndex === null}
    on:click={() => (isViewingPreview = true)}
    disabled={$mediaStore.previewIndex === null}>preview</button
  >
</div>

{#if isViewingPreview}
  <video class="max-h-[50%] border-2 border-neutral-800" bind:this={previewVideo} src={previewSrc}>
    <track kind="captions" />
  </video>
{:else}
  <video class="aspect-video w-100 max-h-[50%] border-2 border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950" bind:this={editorVideo}>
    <track kind="captions" />
  </video>
{/if}

<p class="text-white">{currentVideo?.currentTime}</p>

<div class="w-100 flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => resetVideoTime(0)}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPlaying = !isPlaying)}>{isPlaying ? "⏸️" : "▶️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => resetVideoTime(-1)}>⏩</button>
</div>
