<script lang="ts">
  import { timeline } from "$lib/stores";

  export let timelineWidth: number;
  export let scrollX: number;

  $: numTicks = Math.ceil(timelineWidth / $timeline.zoomScale);

  // breakpoints for timing tick scale (i.e. seconds per tick)
  // $: timingScale = 1;

  // gets the position of a tick given its index.
  const calculatePos = (idx: number) => {
    let x = $timeline.zoomScale * idx - scrollX;
    while (x < 0) x += $timeline.zoomScale * numTicks;
    return x;
  };

  const getTimestamp = (idx: number) => {
    let x = $timeline.zoomScale * idx - scrollX;
    let y = idx;
    // if x <= 0, add i + numTicks * number of wraps
    while (x < 0) {
      x += $timeline.zoomScale * numTicks;
      y += numTicks;
    }
    return y;
  };
</script>

<div class="absolute w-full h-6 top-0 transform" style="--tw-translate-x:{scrollX}px;">
  {#key scrollX || $timeline.zoomScale || timelineWidth}
    {#each { length: numTicks } as _, i}
      <div class="text-white absolute w-px h-6 top-0 left-0 bg-gray-300" style="left:{calculatePos(i)}px;">{getTimestamp(i)}</div>
    {/each}
  {/key}
</div>
