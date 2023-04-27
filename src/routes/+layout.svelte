<script lang="ts">
  import MediaPool from "$lib/components/mediaPool/MediaPool.svelte";
  import Player from "$lib/components/Player.svelte";
  import ResizeStalk from "$lib/components/ResizeStalk.svelte";
  import Timeline from "$lib/components/timeline/Timeline.svelte";
  import { studio } from "$lib/stores";
  import "../app.css";

  let isResizing = false;
  let mediaColumnWidth = "40vw";
  let timelineColumnWidth = "10vw";
  let timelineHeight = "384px";

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !$studio.resizeMode) return;

    if ($studio.resizeMode === "mediaCol") mediaColumnWidth = `${e.clientX}px`;
    else if ($studio.resizeMode === "timelineCol") timelineColumnWidth = `${e.clientX}px`;
    else if ($studio.resizeMode === "row") timelineHeight = `calc(100vh - ${e.clientY}px)`;
  };

  const handleDrop = () => {
    if (!$studio.dragData) return;

    $studio.dragData = null;
  };
</script>

<svelte:window on:mousemove={(e) => $studio.dragData && $studio.mouse.set({ x: e.clientX, y: e.clientY })} on:mouseup={handleDrop} />

<main
  style="--row-width: minmax(256px, {timelineHeight});"
  class="w-full h-[100dvh] bg-neutral-950 grid grid-cols-1 grid-rows-[minmax(0,1fr),3px,var(--row-width)] transition-none"
  class:select-none={isResizing}
  on:mousemove={(e) => handleResize(e)}
  on:mousedown={(e) => e.button === 0 && (isResizing = true)}
  on:mouseup={() => {
    isResizing = false;
    $studio.resizeMode = null;
  }}
>
  <section
    style="--media-col-width: minmax(320px, {mediaColumnWidth});"
    class="grid grid-rows-1 grid-cols-[var(--media-col-width),3px,minmax(0,1fr)] transition-none"
  >
    <MediaPool />
    <ResizeStalk resizeMode="mediaCol" />
    <div class="flex flex-col justify-center items-center gap-8 p-8">
      <Player />
    </div>
  </section>
  <ResizeStalk resizeMode="row" />
  <section
    style="--timeline-col-width: minmax(320px, {timelineColumnWidth});"
    class="grid grid-rows-1 grid-cols-[var(--timeline-col-width),3px,minmax(0,1fr)] transition-none"
  >
    <p>tracks</p>
    <ResizeStalk resizeMode="timelineCol" />
    <Timeline />
  </section>
</main>
