<script lang="ts">
  import { player, timeline, secondWidth } from "$lib/stores";

  export let scrollX: number;
  export let canCalcRuntime: boolean = false;

  const timingRules: ((arg0: number) => number)[] = [(runtime) => runtime / 3600, (runtime) => (runtime % 3600) / 60, (runtime) => runtime % 60];

  let width: number;
  let previousPauseState = true;

  $: offset = Math.floor(scrollX / (width / numSections));
  $: numSections = Math.ceil(Math.max(3, Math.min(15, width / $secondWidth)));

  // FIXME: 22 is magic padding number; this will not work in all cases due to padding based off of rem
  const calcRuntime = (e: MouseEvent) => canCalcRuntime && ($timeline.runtime = (e.clientX - 22 + scrollX) / $secondWidth);

  const handleMouseDown = (e: MouseEvent) => {
    previousPauseState = $player.isPaused;
    $player.isPaused = true;
    canCalcRuntime = true;
    calcRuntime(e);
  };

  $: if (!canCalcRuntime) $player.isPaused = previousPauseState;
</script>

<div
  class="min-w-full h-8 flex select-none transition-none"
  style="width: {numSections * $secondWidth}px; transform: translateX({-scrollX % (width / numSections)}px);"
  bind:clientWidth={width}
  on:mousemove={calcRuntime}
  on:mousedown={handleMouseDown}
>
  {#each { length: numSections + 1 } as _, i}
    <div
      class="border-l-[2px] border-neutral-500 relative h-full transition-none flex before:absolute before:w-full before:h-1 to-neutral-700
      before:bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,var(--tw-gradient-to)_3px,var(--tw-gradient-to)_4px)]"
      style="width: {$secondWidth}px; min-width: calc(100% / {numSections});"
    >
      <div class="absolute left-1 flex bottom-0">
        {#each timingRules as r}
          <p class="text-neutral-400 font-mono text-xs">
            {Math.floor(r((i + offset) * Math.max(1, width / numSections / $secondWidth)))
              .toString()
              .padStart(2, "0")}:
          </p>
        {/each}
        <p class="text-neutral-400 font-mono text-xs">
          {Math.round((((i + offset) * Math.max(1, width / numSections / $secondWidth)) % 1) * 1000)
            .toString()
            .padStart(3, "0")
            .slice(0, 3)}
        </p>
      </div>
      {#each [1, 1, 2, 1, 1, 1] as tickHeight, tickIdx}
        {#if tickIdx === 5}
          <div class="w-full" />
        {:else}
          <div class="w-full relative border-r-[2px] border-r-neutral-600" style="height: {tickHeight * 8}px" />
        {/if}
      {/each}
    </div>
  {/each}
</div>
