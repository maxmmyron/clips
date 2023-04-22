<script lang="ts">
  import { timeline } from "$lib/stores";
  import TimelineElement from "./TimelineElement.svelte";

  let zoomScale = 5;
</script>

<div class="w-full h-full overflow-x-auto flex">
  <div class="w-2/5 h-full bg-neutral-900 border-r-2 border-r-neutral-700 flex-shrink-0" />
  <div class="flex items-center">
    {#each $timeline as options}
      <TimelineElement {options} {zoomScale} />
    {/each}
  </div>
</div>
