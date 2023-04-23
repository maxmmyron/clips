<script lang="ts">
  import MediaPool from "$lib/components/mediaPool/MediaPool.svelte";
  import Player from "$lib/components/Player.svelte";
  import Timeline from "$lib/components/timeline/Timeline.svelte";
  import "../app.css";

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !resizeMode) return;

    if (resizeMode === "col") columnWidth = `${e.clientX}px`;
    else if (resizeMode === "row") rowWidth = `calc(100vh - ${e.clientY}px)`;
    else if (resizeMode === "corner") {
      columnWidth = "{e.clientX}px";
      rowWidth = `calc(100vh - ${e.clientY}px)`;
      columnWidth = `${e.clientX}px`;
    }
  };

  let columnWidth = "384px";
  let rowWidth = "384px";
  let isResizing = false;
  let resizeMode: "col" | "row" | "corner" | null = null;
</script>

<main
  style="--col-width:minmax(320px, {columnWidth}); --row-width:minmax(calc(256px), {rowWidth}););"
  class="w-full h-[100dvh] bg-neutral-950 grid grid-cols-[var(--col-width),3px,minmax(0,1fr)] grid-rows-[minmax(0,1fr),3px,var(--row-width)] transition-none"
  class:select-none={isResizing}
  on:mousemove={(e) => handleResize(e)}
  on:mousedown={(e) => e.button === 0 && (isResizing = true)}
  on:mouseup={() => {
    isResizing = false;
    resizeMode = null;
  }}
>
  <div class="row-start-1 col-start-1">
    <MediaPool />
  </div>

  <div class="row-start-1 col-start-3 flex flex-col justify-center items-center gap-8 p-8">
    <Player />
  </div>

  <div class="row-start-3 col-start-1">
    <p class="text-white">tracks</p>
  </div>

  <div class="row-start-3 col-start-3">
    <Timeline />
  </div>

  <div class="row-start-2 col-start-3 flex justify-center items-center z-10 pointer-events-none">
    <div class="w-24 h-0.5 bg-neutral-700 rounded-full" />
  </div>
  <div class="relative row-start-2 col-span-full bg-neutral-800 flex justify-center items-center overflow-visible">
    <div class="absolute w-full mh-5 cursor-row-resize" on:mousedown={(e) => (resizeMode = "row")} />
  </div>

  <div class="col-start-2 row-start-1 flex justify-center items-center z-10 pointer-events-none">
    <div class="w-0.5 h-24 bg-neutral-700 rounded-full" />
  </div>
  <div class="relative col-start-2 row-span-full bg-neutral-800 flex justify-center items-center overflow-visible">
    <div class="absolute w-5 h-full cursor-col-resize" on:mousedown={(e) => (resizeMode = "col")} />
  </div>

  <div class="relative row-start-2 col-start-2 bg-neutral-600 flex justify-center items-center overflow-visible">
    <div class="w-3 h-3 absolute bg-neutral-600" />
    <div class="absolute w-4 h-4 cursor-move" on:mousedown={(e) => (resizeMode = "corner")} />
  </div>
</main>

<style>
  main {
    grid-template-rows: 1fr, 2px, [];
  }
</style>
