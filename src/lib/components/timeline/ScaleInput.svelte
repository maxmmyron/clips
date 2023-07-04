<script lang="ts">
  import { timeline } from "$lib/stores";
  import Icon from "../util/Icon.svelte";

  let rangeWidth: number;
</script>

<div class="flex gap-2 items-center">
  <button on:click={() => ($timeline.zoomScale = Math.max(1, $timeline.zoomScale - 1))} class="transition-transform hover:scale-105 active:scale-95">
    <Icon src="icons/zoom_out.svg" />
  </button>
  <div class="flex items-center" bind:clientWidth={rangeWidth}>
    <div
      class="z-10 absolute rounded-full w-[--width] h-1 bg-gradient-to-l from-neutral-400 to-neutral-700 bg-[size:var(--width)px_1px]"
      style="--width: {rangeWidth * (($timeline.zoomScale - 1) / 9)}px"
    />
    <input type="range" min="1" max="10" bind:value={$timeline.zoomScale} />
  </div>
  <button on:click={() => ($timeline.zoomScale = Math.min(10, $timeline.zoomScale + 1))} class="transition-transform hover:scale-105 active:scale-95">
    <Icon src="icons/zoom_in.svg" />
  </button>
</div>

<style>
  input[type="range"],
  input[type="range"]::-webkit-slider-thumb,
  input[type="range"]::-moz-range-thumb {
    /* Reset */
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-runnable-track,
  input[type="range"]::-moz-range-track {
    @apply w-full h-1 bg-neutral-600 border-2 border-neutral-500 rounded-full;
  }

  input[type="range"]::-webkit-slider-thumb,
  input[type="range"]::-moz-range-thumb {
    @apply w-3 h-3 bg-neutral-500 rounded-full border-2 border-neutral-400 shadow-md;
  }
</style>
