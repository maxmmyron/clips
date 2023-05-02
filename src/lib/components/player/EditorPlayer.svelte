<script lang="ts">
  import { player } from "$lib/stores";

  let canvasPlayer: HTMLCanvasElement;
  let currentTime = 0;
  let isPaused = true;

  function setPlayerTime(arg0: number): any {
    throw new Error("Function not implemented.");
  }
</script>

<canvas bind:this={canvasPlayer} />

<p class="w-full text-white text-right">{currentTime.toPrecision(2)}</p>

<div class="w-full flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(0)}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPaused = !isPaused)}>{isPaused ? "▶️" : "⏸️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(-1)}>⏩</button>
</div>
