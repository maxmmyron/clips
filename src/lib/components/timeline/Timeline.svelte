<script lang="ts">
  import { onMount } from "svelte";
  import Scrubber from "./Scrubber.svelte";
  import TimelineTicks from "./TimelineTicks.svelte";

  export let dragIndex: number;

  let scrollX: number = 0;
</script>

<section class="relative w-full h-full flex flex-col overflow-x-hidden">
  <TimelineTicks {scrollX} />
  <div class="overflow-x-auto flex-grow h-full" on:scroll={(e) => (scrollX = e.currentTarget.scrollLeft)}>
    <div class="w-[200%] h-32 bg-orange-200 rounded-2xl" />
  </div>
  <Scrubber {scrollX} />
</section>
