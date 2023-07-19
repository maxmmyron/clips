<script lang="ts">
  import { player } from "$lib/stores";

  let video: HTMLVideoElement;
  let currentTime = 0;

  $: if (video) $player.isPaused, $player.isPaused ? video.pause() : video.play();
  $: if (video) video.src, video.pause();

  /**
   * Sets video and time and pauses playback.
   */
  const setVideoTime = (time: number) => {
    if (!video) return;
    video.pause();
    currentTime = time === -1 ? video.duration : time;
  };
</script>

<video class="w-full h-full" bind:this={video} src={$player.source} bind:currentTime>
  <track kind="captions" />
</video>

<p class="w-full text-white text-right">{currentTime.toPrecision(2)}</p>

<div class="w-full flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setVideoTime(0)}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => ($player.isPaused = !$player.isPaused)}>{$player.isPaused ? "▶️" : "⏸️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setVideoTime(-1)}>⏩</button>
</div>
