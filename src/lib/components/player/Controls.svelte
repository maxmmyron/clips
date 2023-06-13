<script lang="ts">
  import { player, timeline } from "$lib/stores";
  import Button from "../util/Button.svelte";

  function setPlayerTime(front: boolean = true): any {
    console.log(`skipping to ${front ? "front" : "back"}`);
    $player.isPaused = true;

    $timeline.runtime = front ? 0 : $timeline.duration;
    $timeline.current = front ? $timeline.timeline.head : $timeline.timeline.tail;
  }
</script>

<div class="flex justify-center gap-4">
  <Button onClick={() => setPlayerTime()} disabled={$timeline.runtime === 0}>⏪</Button>
  <Button onClick={() => ($player.isPaused = !$player.isPaused)}>{$player.isPaused ? "▶️" : "⏸️"}</Button>
  <Button onClick={() => setPlayerTime(false)} disabled={$timeline.current === null}>⏩</Button>
</div>
