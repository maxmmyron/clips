<script lang="ts">
  import { timeline, secondWidth } from "$lib/stores";

  export let scrollX: number;

  $: scrubberPos = $timeline.runtime * $secondWidth - scrollX;
</script>

<div
  id="scrubber"
  style="left: {scrubberPos}px"
  class="absolute w-0.5 h-full top-1/2 transform -translate-y-1/2 bg-neutral-300 rounded-full pointer-events-none"
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
