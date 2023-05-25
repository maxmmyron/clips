<script lang="ts">
  import MediaPool from "$lib/components/MediaPool.svelte";
  import Player from "$lib/components/player/Player.svelte";
  import ResizeStalk from "$lib/components/util/ResizeStalk.svelte";
  import Timeline from "$lib/components/Timeline.svelte";
  import Export from "$lib/components/util/Export.svelte";

  import { studio, timeline } from "$lib/stores";
  import { spring } from "svelte/motion";
  import { onMount } from "svelte";
  import { dev } from "$app/environment";
  import { inject } from "@vercel/analytics";

  import "../app.css";

  inject({ mode: dev ? "development" : "production" });

  let isResizing = false;
  let mediaColumnWidth = "40vw";
  let timelineColumnWidth = "10vw";
  let timelineHeight = "384px";
  let sizeQuery = -1,
    touchModeQuery = -1;

  $: ghostPos = $studio.draggable.ghost.pos;
  $: ghostSize = $studio.draggable.ghost.size;

  onMount(() => {
    $studio.audioContext = new AudioContext();
    sizeQuery = matchMedia("(max-width: 768px), (max-height: 768px)").matches ? 0 : 1;
    touchModeQuery = matchMedia("(hover: none) and (pointer: coarse)").matches ? 0 : 1;
  });

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !$studio.resize) return;

    if ($studio.resize === "media_col") mediaColumnWidth = `${e.clientX}px`;
    else if ($studio.resize === "timeline_col") timelineColumnWidth = `${e.clientX}px`;
    else if ($studio.resize === "row") timelineHeight = `calc(100vh - ${e.clientY}px)`;
  };

  const handleDrag = (e: MouseEvent) => {
    $studio.mouse = { x: e.clientX, y: e.clientY };

    if (!$studio.draggable.origin?.pos) return;

    if ($studio.draggable.event === "start") {
      const dist = { x: e.clientX - $studio.draggable.origin.pos.x, y: e.clientY - $studio.draggable.origin.pos.y };
      if (Math.abs(dist.x) < 30 && Math.abs(dist.y) < 30) return;

      $studio.draggable.event = "drag";
    }

    if ($studio.draggable.current.region !== null) return;

    ghostPos.set({ x: $studio.mouse.x, y: $studio.mouse.y });
    ghostSize.set({ width: 32, height: 32 });
  };

  const handleDrop = () => {
    if (!$studio.draggable.media) return;

    $studio.draggable = {
      media: null,
      origin: null,
      event: null,
      current: { region: null },
      ghost: {
        pos: spring({ x: 0, y: 0 }),
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
      $studio.resize = null;
    }}
  >
    <section
      style="--media-col-width: minmax(320px, {mediaColumnWidth});"
      class="grid grid-rows-1 grid-cols-[var(--media-col-width),3px,minmax(0,1fr)] transition-none"
    >
      <MediaPool />
      <ResizeStalk resize="media_col" />
      <div class="flex flex-col justify-center items-center gap-8 p-8">
        <Export />
        <Player />
      </div>
    </section>
    <ResizeStalk resize="row" />
    <section
      style="--timeline-col-width: minmax(320px, {timelineColumnWidth});"
      class="grid grid-rows-1 grid-cols-[var(--timeline-col-width),3px,minmax(0,1fr)] transition-none"
    >
      <p>tracks</p>
      <ResizeStalk resize="timeline_col" />
      <Timeline />
    </section>
  </main>

  {#if $studio.draggable.media && $studio.draggable.event !== "start"}
    <div
      class="z-10 absolute w-6 h-6 rounded-md bg-blue-600 opacity-50 transition-none pointer-events-none"
      style="left: {$ghostPos.x}px; top: {$ghostPos.y}px; width: {$ghostSize.width}px; height: {$ghostSize.height}px;"
    />
  {/if}
{/if}
