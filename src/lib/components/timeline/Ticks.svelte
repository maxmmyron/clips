<script lang="ts">
  import { timeline } from "$lib/stores";

  export let timelineWidth: number;
  export let scrollX: number;

  // exponential factor for the number of ticks to display.
  const expFactor = 1.4;

  $: numTicks = Math.ceil(timelineWidth / $timeline.zoomScale);

  // The zoom scale scaled by the exponential factor.
  $: scaledZoom = $timeline.zoomScale ** expFactor;

  // A factor determining how many ticks to skip based on the zoom level.
  $: skipFactor = Math.floor((($timeline.zoomScale - 120) / 40) ** 2);

  const shouldSkip = (idx: number) => (skipFactor > 0 ? idx % skipFactor !== 0 : false);

  // gets the position of a tick given its index.
  const calcPos = (idx: number) => {
    let x = scaledZoom * idx - scrollX;
    while (x < 0) x += scaledZoom * numTicks;
    return x;
  };

  const calcTime = (idx: number) => {
    let x = scaledZoom * idx - scrollX;
    let y = idx;
    // if x <= 0, add i + numTicks * number of wraps
    while (x < 0) {
      x += scaledZoom * numTicks;
      y += numTicks;
    }
    return y;
  };
</script>

<div class="absolute w-full h-6 top-0 transform" style="--tw-translate-x:{scrollX}px;">
  {#key scrollX || $timeline.zoomScale || timelineWidth}
    {#each { length: numTicks } as _, i}
      {#if !shouldSkip(i)}
        <div class="text-white absolute w-px h-6 top-0 left-0 bg-gray-300" style="left:{calcPos(i)}px;">{calcTime(i)}</div>
      {/if}
    {/each}
  {/key}
</div>
