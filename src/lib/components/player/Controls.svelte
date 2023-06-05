<script lang="ts">
  import { player, timeline } from "$lib/stores";

  function setPlayerTime(front: boolean = true): any {
    console.log(`skipping to ${front ? "front" : "back"}`);
    $player.isPaused = true;

    $timeline.runtime = front ? 0 : $timeline.duration;
    $timeline.current = front ? $timeline.timeline.head : $timeline.timeline.tail;
  }
</script>

<div class="flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed" on:click={() => setPlayerTime()}>
    ⏪
  </button>
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
    on:click={() => ($player.isPaused = !$player.isPaused)}
  >
    {$player.isPaused ? "▶️" : "⏸️"}
  </button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed" on:click={() => setPlayerTime(false)}>
    ⏩
  </button>
</div>
