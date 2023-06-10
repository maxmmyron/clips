<script lang="ts">
  import MediaPool from "$lib/components/media/MediaPool.svelte";
  import Player from "$lib/components/player/Player.svelte";
  import Timeline from "$lib/components/timeline/Timeline.svelte";
  import Export from "$lib/components/util/Export.svelte";

  import { mediaPool, studio, timeline } from "$lib/stores";
  import { spring } from "svelte/motion";
  import { onMount } from "svelte";
  import { dev } from "$app/environment";
  import { inject } from "@vercel/analytics";

  import "../app.css";
  import { loadFFmpeg } from "../lib/util/FFmpegManager";
  import Controls from "$lib/components/player/Controls.svelte";
  import Runtime from "$lib/components/player/Runtime.svelte";
  import InspectorWrapper from "$lib/components/media/InspectorWrapper.svelte";
  import { fly } from "svelte/transition";
  import Marquee from "$lib/components/util/Marquee.svelte";
  import Ghost from "$lib/components/util/Ghost.svelte";

  inject({ mode: dev ? "development" : "production" });

  let sizeQuery = -1,
    touchModeQuery = -1;

  let editorWidth: number, editorHeight: number;

  $: ghostPos = $studio.draggable.ghost.pos;
  $: ghostSize = $studio.draggable.ghost.size;
  $: isInspectorVisible = $mediaPool.selected.length > 0;

  let isStudioLoaded = false;
  let preloadMessage = "loading...";

  onMount(async () => {
    preloadMessage = "Loading audio context instance...";
    $studio.audioContext = new AudioContext();

    preloadMessage = "Checking media queries...";

    preloadMessage = "Checking media queries...";
    sizeQuery = matchMedia("(max-width: 768px), (max-height: 768px)").matches ? 0 : 1;
    touchModeQuery = matchMedia("(hover: none) and (pointer: coarse)").matches ? 0 : 1;

    preloadMessage = "Loading FFmpeg...";
    await loadFFmpeg();
    isStudioLoaded = true;

    preloadMessage = "Loading FFmpeg...";
    await loadFFmpeg();
    isStudioLoaded = true;
  });

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
    ghostSize.set({ width: 80, height: 45 });
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

{#if !isStudioLoaded}
  <div class="w-full h-[100dvh] bg-neutral-950 flex flex-col justify-center items-center gap-8 p-8">
    <p class="text-2xl text-white">{preloadMessage}</p>
  </div>
{:else if sizeQuery + touchModeQuery !== 2}
  <div class="w-full h-[100dvh] bg-neutral-950 flex flex-col justify-center items-center gap-8 p-8">
    <p class="text-2xl text-white">Sorry, this app is not optimized for mobile devices.</p>
    <p class="text-2xl text-white">Please use a desktop browser.</p>
  </div>
{:else}
  <main class="w-full h-[100dvh] bg-[#0E0E0E] grid grid-rows-[48px,auto,48px,384px] grid-cols-[1fr,1fr,0.618fr] gap-1 p-1">
    <!-- Settings Ribbon -->
    <div class="bg-neutral-900 rounded-md p-4 flex items-center gap-4" />

    <!-- Export Settings -->
    <div class="bg-neutral-900 rounded-md p-4 flex justify-between items-center col-span-2">
      <div class="flex">
        <p contenteditable class="text-neutral-200 w-min font-mono" bind:innerText={$studio.exportName}>untitled</p>
        <p class="text-neutral-200 font-mono">.mp4</p>
      </div>
      <Export />
    </div>

    <!-- Media Pool -->
    <div class="bg-neutral-900 rounded-md p-4">
      <MediaPool />
    </div>

    <!-- Player -->
    <div class="flex flex-col justify-center items-center col-start-2 row-start-2 col-span-2">
      <div class="bg-black w-full aspect-video min-w-[480px] max-w-[calc(90%)]" bind:clientWidth={editorWidth} bind:clientHeight={editorHeight}>
        <Player width={editorWidth} height={editorHeight} />
      </div>
    </div>

    <!-- Inspector -->
    {#if $mediaPool.selected.length}
      <!-- No padding here as it would interfere with click events at inspector edge -->
      <div class="relative z-10 bg-neutral-900 rounded-md row-start-2 col-start-3 shadow-inner" transition:fly={{ x: "100%" }}>
        <InspectorWrapper />
      </div>
    {/if}

    <!-- Timeline Controls -->
    <div class="bg-neutral-900 rounded-md p-4">
      <input type="range" min="10" max="100" bind:value={$timeline.zoomScale} />
    </div>

    <!-- Video Controls -->
    <div class="bg-neutral-900 rounded-md p-4 grid grid-cols-3 grid-rows-1 row-start-3 col-start-2 col-span-2">
      <div class="col-start-2 flex justify-center items-center">
        <Controls />
      </div>

      <div class="flex justify-end items-center">
        <Runtime />
      </div>
    </div>

    <!-- The lack of support for subgrid--as well as calc's lack of support for <flex> data types--makes this hack
      slightly necessary. We use 0.4975fr for the fractional unit since it approximately compensates for the 4px gap
      introduced with the repeated column.-->
    <!-- Timeline Container -->
    <div class="grid grid-rows-1 grid-cols-[repeat(2,0.4975fr),1.618fr] gap-1 col-span-full row-start-4">
      <!-- Timeline Track List -->
      <div class="bg-neutral-900 rounded-md p-4" />
      <!-- Timeline Container -->
      <div class="bg-neutral-900 rounded-md p-4 col-span-2">
        <Timeline />
      </div>
    </div>
  </main>

  <Ghost />
{/if}
