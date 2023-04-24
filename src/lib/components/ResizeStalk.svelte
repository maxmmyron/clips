<script lang="ts">
  import { studio } from "$lib/stores";

  export let resizeMode: "mediaCol" | "timelineCol" | "row" | null = null;
</script>

<div class="relative bg-neutral-800 flex justify-center items-center overflow-visible">
  {#if resizeMode == "mediaCol" || resizeMode == "timelineCol"}
    <div class="absolute w-5 h-full cursor-col-resize" on:mousedown={(e) => ($studio.resizeMode = resizeMode)} />
  {:else if resizeMode == "row"}
    <div class="absolute w-full h-5 cursor-row-resize" on:mousedown={(e) => ($studio.resizeMode = resizeMode)} />
  {/if}
</div>
