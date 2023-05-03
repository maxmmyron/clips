<script lang="ts">
  import { timeline } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";

  export let width = 640;
  export let height = 480;

  let currentTime = 0;
  let isPaused = true;
  let video: HTMLVideoElement;

  $: if (video) isPaused, isPaused ? video.pause() : video.play();

  let render: Render;
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

  function setPlayerTime(time: number): any {
    isPaused = true;
    currentTime = time === -1 ? video.duration : time;
  }
</script>

<video class="hidden" muted bind:this={video} src={$timeline.clips[0]?.src} bind:currentTime>
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

<p class="w-full text-white text-right">{currentTime.toPrecision(2)}</p>

<div class="w-full flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(0)}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPaused = !isPaused)}>{isPaused ? "▶️" : "⏸️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(-1)}>⏩</button>
</div>
