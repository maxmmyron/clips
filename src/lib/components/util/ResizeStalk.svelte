<script lang="ts">
  import { studio } from "$lib/stores";

  export let resize: "media_col" | "timeline_col" | "row" | null = null;
</script>

<div class="relative bg-neutral-800 flex justify-center items-center overflow-visible">
  {#if resize == "media_col" || resize == "timeline_col"}
    <div class="absolute w-5 h-full cursor-col-resize" on:mousedown={(e) => ($studio.resize = resize)} />
  {:else if resize == "row"}
    <div class="absolute w-full h-5 cursor-row-resize" on:mousedown={(e) => ($studio.resize = resize)} />
  {/if}
</div>
