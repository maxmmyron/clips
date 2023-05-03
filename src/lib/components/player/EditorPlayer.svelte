<script lang="ts">
  import { timeline } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";

  let currentTime = 0;
  let currentSrc: string | null = null;
  let isPaused = true;
  let video: HTMLVideoElement;

  $: currentSrc = $timeline.clips[0]?.src;

  $: if (video) isPaused, isPaused ? video.pause() : video.play();

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if (!currentSrc) {
      console.warn("No source to render");
      return;
    }
    if (!video) {
      console.warn("No video to render");
      return;
    }

    context.drawImage(video, 0, 0);
  };

  function setPlayerTime(time: number): any {
    isPaused = true;
    currentTime = time === -1 ? video.duration : time;
  }
</script>

<video class="hidden" muted bind:this={video} src={currentSrc} bind:currentTime>
  <track kind="captions" />
</video>

{#if $timeline.clips.length}
  <Canvas class="w-full h-full">
    <Layer {render} />
  </Canvas>
{:else}
  <div class="w-full h-full flex justify-center items-center">
    <p class="text-neutral-400 font-mono">no clips in timeline （＞人＜；）</p>
  </div>
{/if}

<p class="w-full text-white text-right">{currentTime.toPrecision(2)}</p>

<div class="w-full flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(0)}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPaused = !isPaused)}>{isPaused ? "▶️" : "⏸️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(-1)}>⏩</button>
</div>
