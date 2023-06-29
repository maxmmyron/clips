<script lang="ts">
  import { timeline } from "$lib/stores";

  export let scrollX: number;
  export let timelineSecondWidth: number;

  $: secondScale = 2 ** (5 - $timeline.zoomScale);
  $: scrubberPos = $timeline.runtime * (timelineSecondWidth / secondScale) - scrollX;
</script>

<div
  id="scrubber"
  style="left: {scrubberPos}px"
  class="absolute w-0.5 h-3/4 top-1/2 transform -translate-y-1/2 bg-neutral-300 rounded-full pointer-events-none"
/>

<style>
  #scrubber::before {
    content: "";
    position: absolute;
    top: -8px;
    left: -5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: rgb(212 212 212 / 1);
  }
</style>
