<script lang="ts">
  import { timeline } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";

  export let width = 640;
  export let height = 480;

  let currentSrcIndex = 0;
  let accumulatedTime = 0;
  let currentTime = 0;
  let isPaused = true;
  let video: HTMLVideoElement;
  let render: Render;

  $: if (video) isPaused, isPaused ? video.pause() : video.play();

  const handleEnded = () => {
    accumulatedTime += video.duration;
    if (currentSrcIndex === $timeline.clips.length - 1) {
      isPaused = true;
      return;
    }
    currentSrcIndex = currentSrcIndex + 1;
  };

  $: render = ({ context, width, height }) => {
    $t;
    if (!video) {
      console.warn("No video to render");
      return;
    }

    const mediaSize = {
      width: video.videoWidth * Math.min(width / video.videoWidth, height / video.videoHeight),
      height: video.videoHeight * Math.min(width / video.videoWidth, height / video.videoHeight),
    };

    const mediaPosition = {
      x: Math.max(0, (width - mediaSize.width) / 2),
      y: Math.max(0, (height - mediaSize.height) / 2),
    };

    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, mediaPosition.x, mediaPosition.y, mediaSize.width, mediaSize.height);
  };

  function setPlayerTime(front: boolean = true): any {
    isPaused = true;
    if (front) {
      currentSrcIndex = 0;
      accumulatedTime = 0;
    } else {
      currentSrcIndex = $timeline.clips.length - 1;
      accumulatedTime = $timeline.clips.reduce((acc, cur) => acc + cur.duration, 0) - video.duration;
      currentTime = video.duration;
    }
  }
</script>

<video
  class="hidden"
  muted
  bind:this={video}
  src={$timeline.clips[currentSrcIndex]?.src}
  on:ended={handleEnded}
  on:canplay={() => !isPaused && video.play()}
  bind:currentTime
>
  <track kind="captions" />
</video>

<div class="w-full h-full flex justify-center items-center">
  {#if $timeline.clips.length}
    <Canvas {width} {height}>
      <Layer {render} />
    </Canvas>
  {:else}
    <p class="text-neutral-400 font-mono">no clips in timeline （＞人＜；）</p>
  {/if}
</div>

<p class="w-full text-white text-right">{(accumulatedTime + currentTime).toPrecision(2)}</p>

<div class="w-full flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(true)}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPaused = !isPaused)}>{isPaused ? "▶️" : "⏸️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(false)}>⏩</button>
</div>
