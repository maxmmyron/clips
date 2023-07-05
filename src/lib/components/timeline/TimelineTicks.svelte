<script lang="ts">
  import { player, timeline } from "$lib/stores";

  export let scrollX: number;

  let width: number;
  let canCalcRuntime = false,
    previousPauseState = false;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

  $: secondWidth = 2 ** $timeline.zoomScale;
  $: offset = Math.floor(scrollX / (width / numSections));
  $: numSections = Math.ceil(Math.max(3, Math.min(15, width / secondWidth)));

  const calcRuntime = (e: MouseEvent) => canCalcRuntime && ($timeline.runtime = (e.clientX - 1.25 * rem + scrollX) / secondWidth);

  const handleMouseDown = (e: MouseEvent) => {
    previousPauseState = $player.isPaused;
    $player.isPaused = true;
    canCalcRuntime = true;
    calcRuntime(e);
  };

  const handleMouseUp = (e: MouseEvent) => {
    $player.isPaused = previousPauseState;
    canCalcRuntime = false;
  };
</script>

<div
  class="min-w-full h-12 flex select-none"
  style="width: {(numSections + 1) * secondWidth}px; transform: translateX({-scrollX % (width / numSections)}px);"
  bind:clientWidth={width}
  on:mousemove={calcRuntime}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
>
  {#each { length: numSections + 1 } as _, i}
    <div class="relative rounded-md bg-blue-200 h-full" style="width: {secondWidth}px; min-width: calc(100% / {numSections});">
      {Math.floor((i + offset) * Math.max(1, width / numSections / secondWidth) * 100) / 100}
    </div>
  {/each}
</div>
