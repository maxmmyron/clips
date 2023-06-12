<script>
  import { timeline } from "$lib/stores";
  import Icon from "../util/Icon.svelte";
</script>

<div class="flex gap-1 items-center">
  <button on:click={() => ($timeline.zoomScale = Math.max(5, $timeline.zoomScale - 5))}>
    <Icon src="icons/zoom_out.svg" />
  </button>
  <input type="range" min="5" max="120" bind:value={$timeline.zoomScale} />
  <button on:click={() => ($timeline.zoomScale = Math.min(120, $timeline.zoomScale + 5))}>
    <Icon src="icons/zoom_in.svg" />
  </button>
</div>
