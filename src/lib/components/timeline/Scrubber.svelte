<script lang="ts">
  import { timeline } from "$lib/stores";

  $: scrubberPos = $timeline.runtime * $timeline.zoomScale;
</script>

<div id="scrubber" style="left: {scrubberPos}px" class="absolute w-0.5 h-3/4 top-1/2 transform -translate-y-1/2 bg-blue-500 rounded-full pointer-events-none" />

<style>
  #scrubber::before {
    content: "";
    position: absolute;
    top: -8px;
    left: -5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: rgb(11 113 230 / 1);
  }
</style>
