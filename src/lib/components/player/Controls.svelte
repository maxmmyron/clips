<script lang="ts">
  import { player, timeline } from "$lib/stores";
  import Button from "../util/Button.svelte";

  function setPlayerTime(front: boolean = true): any {
    $player.isPaused = true;

    $timeline.runtime = front ? 0 : $timeline.duration;
  }
</script>

<div class="flex justify-center gap-4">
  <Button onClick={() => setPlayerTime()} key="ArrowLeft" showKeyBind={false} useShift disabled={$timeline.runtime === 0}>⏪</Button>
  <Button onClick={() => ($player.isPaused = !$player.isPaused)} key="Space" showKeyBind={false}>{$player.isPaused ? "▶️" : "⏸️"}</Button>
  <Button onClick={() => setPlayerTime(false)} key="ArrowRight" showKeyBind={false} useShift>⏩</Button>
</div>
