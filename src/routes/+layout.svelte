<script lang="ts">
  import MediaPool from "$lib/components/MediaPool.svelte";
  import Player from "$lib/components/player/Player.svelte";
  import ResizeStalk from "$lib/components/util/ResizeStalk.svelte";
  import Timeline from "$lib/components/Timeline.svelte";
  import { studio, timeline } from "$lib/stores";
  import "../app.css";
  import { spring } from "svelte/motion";
  import { onMount } from "svelte";

  import { dev } from "$app/environment";
  import { inject } from "@vercel/analytics";
  import Export from "$lib/components/util/Export.svelte";

  inject({ mode: dev ? "development" : "production" });

  let isResizing = false;
  let mediaColumnWidth = "40vw";
  let timelineColumnWidth = "10vw";
  let timelineHeight = "384px";
  let sizeQuery = -1,
    touchModeQuery = -1;

  $: ghostPos = $studio.dragData.ghost.position;
  $: ghostSize = $studio.dragData.ghost.size;

  onMount(() => {
    $studio.audioContext = new AudioContext();
    sizeQuery = matchMedia("(max-width: 768px), (max-height: 768px)").matches ? 0 : 1;
    touchModeQuery = matchMedia("(hover: none) and (pointer: coarse)").matches ? 0 : 1;
  });

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !$studio.resizeMode) return;

    if ($studio.resizeMode === "mediaCol") mediaColumnWidth = `${e.clientX}px`;
    else if ($studio.resizeMode === "timelineCol") timelineColumnWidth = `${e.clientX}px`;
    else if ($studio.resizeMode === "row") timelineHeight = `calc(100vh - ${e.clientY}px)`;
  };

  const handleDrag = (e: MouseEvent) => {
    $studio.mouse = { x: e.clientX, y: e.clientY };

    if (!$studio.dragData.originPosition) return;

    if ($studio.dragData.dragEvent === "dragstart") {
      const dist = {
        x: e.clientX - $studio.dragData.originPosition.x,
        y: e.clientY - $studio.dragData.originPosition.y,
      };

      if (Math.abs(dist.x) < 30 && Math.abs(dist.y) < 30) return;
      $studio.dragData.dragEvent = "drag";
    }

    if ($studio.dragData.currentDragRegion !== null) return;

    ghostPos.set({ x: $studio.mouse.x, y: $studio.mouse.y });
    ghostSize.set({ width: 32, height: 32 });
  };

  const handleDrop = () => {
    if (!$studio.dragData.media) return;

    $studio.dragData = {
      media: null,
      originType: null,
      originPosition: null,
      dragEvent: null,
      currentDragRegion: null,
      ghost: {
        position: spring({ x: 0, y: 0 }),
        size: spring({ width: 0, height: 0 }),
      },
    };

    $timeline.dragIndex = -1;
  };
</script>

<svelte:window on:mousemove={handleDrag} on:mouseup={handleDrop} />

{#if sizeQuery + touchModeQuery === -2}
  <div class="w-full h-[100dvh] bg-neutral-950 flex flex-col justify-center items-center gap-8 p-8">
    <p class="text-2xl text-white">Loading...</p>
  </div>
{:else if sizeQuery + touchModeQuery !== 2}
  <div class="w-full h-[100dvh] bg-neutral-950 flex flex-col justify-center items-center gap-8 p-8">
    <p class="text-2xl text-white">Sorry, this app is not optimized for mobile devices.</p>
    <p class="text-2xl text-white">Please use a desktop browser.</p>
  </div>
{:else}
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
        <Export />
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

  {#if $studio.dragData.media && $studio.dragData.dragEvent !== "dragstart"}
    <div
      class="z-10 absolute w-6 h-6 rounded-md bg-blue-600 opacity-50 transition-none pointer-events-none"
      style="left: {$ghostPos.x}px; top: {$ghostPos.y}px; width: {$ghostSize.width}px; height: {$ghostSize.height}px;"
    />
  {/if}
{/if}
