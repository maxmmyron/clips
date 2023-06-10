<script lang="ts">
  import { player, studio, mediaPool } from "$lib/stores";
  import Marquee from "../util/Marquee.svelte";

  export let media: App.Media | null = null;
  export let hasResolved: boolean = true;
  export let currentLoadState: string = "Loading...";
  export let name = "";

  let mediaPreview: HTMLButtonElement;

  $: isSelected = media ? $mediaPool.selected.includes(media.uuid) : false;

  const handleClick = (e: MouseEvent) => {
    if (!media) return;
    if (e.detail == 2) $player.source = media.src;
    else if (e.shiftKey) $mediaPool.selected = [...$mediaPool.selected, media.uuid];
    else $mediaPool.selected = [media.uuid];
  };

  const handleDragStart = (e: MouseEvent) => {
    $studio.draggable = {
      ...$studio.draggable,
      mediaUUID: media ? media.uuid : null,
      origin: {
        pos: { x: e.clientX, y: e.clientY },
        region: "media_pool",
      },
      event: "start",
      current: {
        region: null,
      },
    };

    $studio.draggable.ghost.pos.set({ x: $studio.mouse.x, y: $studio.mouse.y }, { hard: true });
    $studio.draggable.ghost.size.set(
      { width: mediaPreview.getBoundingClientRect().width, height: mediaPreview.getBoundingClientRect().height },
      { hard: true }
    );
  };
</script>

{#if media === null || hasResolved === false}
  <div class="rounded-lg p-1">
    <div class="w-48 aspect-video rounded-md bg-gray-700 animate-pulse mb-2 flex justify-center items-center">
      <p class="text-gray-200">{currentLoadState}</p>
    </div>
    <div class="w-48 overflow-clip grid grid-rows-1 grid-cols-[24px,auto] gap-1 items-center">
      <Marquee class="col-start-2" isSecondaryColor={isSelected}>{name}</Marquee>
    </div>
  </div>
{:else}
  <div class="rounded-lg p-1 transition-colors" class:bg-gray-800={isSelected}>
    <button
      bind:this={mediaPreview}
      on:click|capture|stopPropagation={handleClick}
      class="w-48 aspect-video rounded-md overflow-clip mb-2 bg-black"
      on:mousedown={handleDragStart}
    >
      <slot />
    </button>
    <div class="relative">
      <div
        class="w-48 overflow-clip grid grid-rows-1 grid-cols-[24px,auto] gap-1 items-center after:content-[''] after:w-5 after:h-full after:absolute after:top-0 after:right-0 after:bg-gradient-to-l after:from-{isSelected
          ? 'gray-800'
          : 'neutral-900'} after:to-transparent"
      >
        <img alt="" src="/icons/{media.type}_dark.svg" class="w-4 h-4" />
        <Marquee isSecondaryColor={isSelected}>{media.metadata.title}</Marquee>
      </div>
    </div>
  </div>
{/if}
