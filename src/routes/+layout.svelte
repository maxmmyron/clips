<script lang="ts">
  import MediaPool from "$lib/components/media/MediaPool.svelte";
  import Player from "$lib/components/player/Player.svelte";
  import Timeline from "$lib/components/timeline/Timeline.svelte";
  import Export from "$lib/components/util/Export.svelte";
  import Controls from "$lib/components/player/Controls.svelte";
  import Runtime from "$lib/components/player/Runtime.svelte";
  import InspectorWrapper from "$lib/components/media/InspectorWrapper.svelte";
  import Ghost from "$lib/components/util/Ghost.svelte";
  import Region from "$lib/components/util/Region.svelte";
  import ScaleInput from "$lib/components/timeline/ScaleInput.svelte";
  import Toast from "$lib/components/util/Toast.svelte";
  import { studio, draggable, toasts, audioContext } from "$lib/stores";
  import { spring } from "svelte/motion";
  import { flip } from "svelte/animate";
  import { crossfade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { onMount } from "svelte";
  import { dev } from "$app/environment";
  import { inject } from "@vercel/analytics";
  import { loadFFmpeg } from "$lib/util/FFmpegManager";
  import { fly } from "svelte/transition";
  import "../app.css";

  inject({ mode: dev ? "development" : "production" });

  let sizeQuery = -1,
    touchModeQuery = -1;

  let editorWidth: number, editorHeight: number;

  let selectedMedia: string[] = [];
  let dragIndex: number = -1;

  $: ghostPos = $draggable.ghost.pos;
  $: ghostSize = $draggable.ghost.size;

  let isStudioLoaded = false;
  let preloadMessage = "loading...";

  onMount(async () => {
    preloadMessage = "Loading audio context instance...";
    $audioContext = new AudioContext();

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

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 400,
        easing: quintOut,
        css: (t) => `
          transform: ${transform} translateX(${(1 - t) * 100}%);
          opacity: ${t}
        `,
      };
    },
  });

  const handleDrag = (e: MouseEvent) => {
    $studio.mouse = { x: e.clientX, y: e.clientY };

    if (!$draggable.origin) return;

    if ($draggable.event === "start") {
      const dist = { x: e.clientX - $draggable.origin.pos.x, y: e.clientY - $draggable.origin.pos.y };
      if (Math.abs(dist.x) < 30 && Math.abs(dist.y) < 30) return;

      $draggable.event = "drag";
    }

    if ($draggable.region !== null) return;

    ghostPos.set({ x: $studio.mouse.x, y: $studio.mouse.y });
    ghostSize.set({ width: 80, height: 45 });
  };

  const handleDrop = () => {
    $draggable = {
      media: null,
      origin: null,
      event: null,
      region: null,
      ghost: {
        pos: spring({ x: 0, y: 0 }),
        size: spring({ width: 0, height: 0 }),
      },
    };

    dragIndex = -1;
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
    <Region />

    <!-- Export Settings -->
    <Region class="col-span-2" innerClass="flex justify-between items-center p-4">
      <div class="flex">
        <p contenteditable class="text-neutral-200 w-min font-mono" bind:innerText={$studio.name} />
        <p class="text-neutral-200 font-mono">.mp4</p>
      </div>
      <Export />
    </Region>

    <!-- Media Pool -->
    <Region innerClass="p-4">
      <MediaPool bind:selected={selectedMedia} />
    </Region>

    <!-- Player -->
    <div class="flex flex-col justify-center items-center col-start-2 row-start-2 col-span-2">
      <div class="bg-black w-full aspect-video min-w-[480px] max-w-[calc(90%)]" bind:clientWidth={editorWidth} bind:clientHeight={editorHeight}>
        <Player width={editorWidth} height={editorHeight} />
      </div>
    </div>

    <!-- Inspector -->
    {#if selectedMedia.length}
      <div class="relative z-10 row-start-2 col-start-3" transition:fly={{ x: "100%" }}>
        <Region>
          <InspectorWrapper selected={selectedMedia} />
        </Region>
      </div>
    {/if}

    <!-- Timeline Controls -->
    <Region innerClass="flex items-center px-4">
      <ScaleInput />
    </Region>

    <!-- Video Controls -->
    <Region class="row-start-3 col-start-2 col-span-2" innerClass="grid grid-cols-3 grid-rows-1 px-4">
      <div class="col-start-2 flex justify-center items-center">
        <Controls />
      </div>

      <div class="flex justify-end items-center">
        <Runtime />
      </div>
    </Region>

    <!-- The lack of support for subgrid--as well as calc's lack of support for <flex> data types--makes this hack
      slightly necessary. We use 0.4975fr for the fractional unit since it approximately compensates for the 4px gap
      introduced with the repeated column.-->
    <!-- Timeline Container -->
    <div class="grid grid-rows-1 grid-cols-[repeat(2,0.4975fr),1.618fr] gap-1 col-span-full row-start-4">
      <Region class="col-span-full" innerClass="p-4">
        <Timeline bind:dragIndex />
      </Region>
    </div>
  </main>

  <Ghost />

  <!-- Toast container -->
  <div class="absolute z-20 bottom-4 right-4 flex flex-col gap-4">
    {#each $toasts as toast (toast.uuid)}
      <div in:receive={{ key: toast.uuid, ...receive }} out:send={{ key: toast.uuid, ...send }} animate:flip={{ duration: 200 }}>
        <Toast {toast} />
      </div>
    {/each}
  </div>
{/if}
