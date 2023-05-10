<script lang="ts">
  import { timeline, player } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import { onMount } from "svelte";
  import VideoBuffer from "./VideoBuffer.svelte";

  export let width = 640,
    height = 480;

  let currentPreviewTime = 0;
  let audioContext: AudioContext;

  $: currentVideo = $timeline.videos.get($timeline.clips[$timeline.clipIndex]?.uuid);
  $: if (currentVideo) $player.isPaused ? currentVideo.pause() : currentVideo.play();

  onMount(() => {
    audioContext = new AudioContext();
  });

  $: if (audioContext) $player.isPaused ? audioContext.suspend() : audioContext.resume();
  $: accumulatedTime = $timeline.clips.slice(0, $timeline.clipIndex).reduce((acc, cur) => acc + (cur.duration - cur.startOffset - cur.endOffset), 0);
  $: if ($timeline.clipIndex === -1 && $timeline.clips.length > 0) $timeline.clipIndex = 0;

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if ($timeline.clips.length === 0) return;

    const metadata = $timeline.clips[$timeline.clipIndex];
    const video = $timeline.videos.get(metadata.uuid);

    if (!video) return;

    currentPreviewTime = video.currentTime - metadata.startOffset;

    // TODO: no need to recompute this every frame
    const mediaSize = {
      width: video.videoWidth * Math.min(width / video.videoWidth, height / video.videoHeight),
      height: video.videoHeight * Math.min(width / video.videoWidth, height / video.videoHeight),
    };

    const mediaPosition: [number, number] = [Math.max(0, (width - mediaSize.width) / 2), Math.max(0, (height - mediaSize.height) / 2)];

    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, ...mediaPosition, mediaSize.width, mediaSize.height);
  };

  function setPlayerTime(front: boolean = true): any {
    console.log($timeline.videos);
    $player.isPaused = true;
    if (front) {
      console.log("A");
      $timeline.clipIndex = 0;
      const metadata = $timeline.clips[0];
      const video = $timeline.videos.get(metadata.uuid);
      if (video) video.currentTime = metadata.startOffset;
    } else {
      $timeline.clipIndex = $timeline.clips.length - 1;
      const metadata = $timeline.clips[$timeline.clips.length - 1];
      const video = $timeline.videos.get(metadata.uuid);
      if (video) video.currentTime = metadata.duration - metadata.startOffset - metadata.endOffset;
    }
  }

  const togglePlayState = () => {
    const currentMetadata = $timeline.clips[$timeline.clipIndex];
    const isLastClip = $timeline.clipIndex === $timeline.clips.length;
    const isLastFrame = currentPreviewTime >= currentMetadata.duration - currentMetadata.startOffset - currentMetadata.endOffset;
    if (isLastClip && isLastFrame) {
      setPlayerTime();
    }
    $player.isPaused = !$player.isPaused;
  };
</script>

{#each $timeline.clips as metadata}
  <VideoBuffer {audioContext} {metadata} />
{/each}

<div class="w-full h-full flex justify-center items-center">
  {#if $timeline.clips.length}
    <Canvas {width} {height}>
      <Layer {render} />
    </Canvas>
  {:else}
    <p class="text-neutral-400 font-mono">no clips in timeline （＞人＜；）</p>
  {/if}
</div>

<p class="w-full text-white text-right">{Math.round((accumulatedTime + currentPreviewTime) * 100) / 100 || 0}</p>

<div class="w-full flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime()}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={togglePlayState}>{$player.isPaused ? "▶️" : "⏸️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(false)}>⏩</button>
</div>
