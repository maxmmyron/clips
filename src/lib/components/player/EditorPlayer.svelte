<script lang="ts">
  import { timeline, player } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import { onMount } from "svelte";
  import VideoBuffer from "./VideoBuffer.svelte";

  export let width = 640,
    height = 480;

  let currentPreviewTime = 0;
  let audioContext: AudioContext;
  let accumulatedTime = 0;

  $: currentVideo = $timeline.videos.get($timeline.curr?.uuid || "") || null;
  $: if (currentVideo) $player.isPaused ? currentVideo.pause() : currentVideo.play();

  onMount(() => {
    audioContext = new AudioContext();
  });

  $: if (audioContext) $player.isPaused ? audioContext.suspend() : audioContext.resume();

  // FIXME: doesn't account for duplicate clips in timeline
  $: if ($timeline.curr)
    accumulatedTime = $timeline.clips
      .toArray()
      .slice(0, $timeline.clips.indexOf($timeline.curr.uuid))
      .reduce((acc, { metadata }) => acc + (metadata.duration - metadata.startOffset - metadata.endOffset), 0);

  $: if (!$timeline.curr && $timeline.clips.length > 0) $timeline.curr = $timeline.clips.head;

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if ($timeline.clips.length === 0 || !$timeline.curr) return;

    const metadata = $timeline.curr.metadata;
    const video = $timeline.videos.get($timeline.curr.uuid);

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
    $player.isPaused = true;
    if (front) {
      // FIXME: shit don't render, probably occurring here
      $timeline.curr = $timeline.clips.head;
      $timeline.videos.forEach((video) => (video.currentTime = 0));
    } else {
      $timeline.curr = $timeline.clips.tail;
      if (!$timeline.curr) return;
      const metadata = $timeline.curr.metadata;
      const video = $timeline.videos.get($timeline.curr.uuid);
      if (video) video.currentTime = metadata.duration - metadata.startOffset - metadata.endOffset;
    }
  }

  const togglePlayState = () => {
    if (!$timeline.curr) return;
    const metadata = $timeline.curr.metadata;
    const isLastClip = $timeline.curr === $timeline.clips.tail;
    const isLastFrame = currentPreviewTime >= metadata.duration - metadata.startOffset - metadata.endOffset;
    if (isLastClip && isLastFrame) {
      setPlayerTime();
    }
    $player.isPaused = !$player.isPaused;
  };
</script>

{#each $timeline.clips.toArray() as node}
  <VideoBuffer {audioContext} {node} />
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
