<script lang="ts">
  import { player, studio, mediaPool } from "$lib/stores";

  export let media: App.VideoMedia | App.AudioMedia | App.ImageMedia | null = null;
  export let hasResolved: boolean = true;
  export let currentLoadState: string = "Loading...";
  export let name = "";

  let mediaPreview: HTMLButtonElement;
  let containerWidth: number, nameWidth: number;

  $: isSelected = media && $mediaPool.selected.includes(media.uuid);
  $: shouldNameAnimate = nameWidth > containerWidth;
  $: nameOffset = containerWidth - nameWidth - 16;

  const handleClick = (e: MouseEvent) => {
    if (!media) return;
    if (e.detail == 2) $player.source = media.src;
    else if (e.shiftKey) $mediaPool.selected = [...$mediaPool.selected, media.uuid];
    else $mediaPool.selected = [media.uuid];
  };

  const handleDragStart = (e: MouseEvent) => {
    $studio.draggable = {
      ...$studio.draggable,
      media: media,
      origin: {
        pos: { x: e.clientX, y: e.clientY },
        region: "media_pool",
      },
      event: "start",
      current: {
        region: null,
      },
    };

    $studio.draggable.ghost.pos.set({ x: mediaPreview.getBoundingClientRect().x, y: mediaPreview.getBoundingClientRect().y }, { hard: true });
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
    <div
      class="w-48 overflow-clip grid grid-rows-1 grid-cols-[24px,auto] gap-1 items-center after:content-[''] after:w-5 after:h-full after:absolute after:top-0 after:right-0 after:bg-gradient-to-l after:from-{isSelected
        ? 'gray-800'
        : 'neutral-900'} after:to-transparent"
    >
      <div class="overflow-clip col-start-2" bind:clientWidth={containerWidth}>
        <p
          style="--overflow-scroll-pos: {nameOffset}px"
          class="relative text-neutral-200 font-mono m-0 w-max {shouldNameAnimate && 'animate'}"
          bind:clientWidth={nameWidth}
        >
          {name}
        </p>
      </div>
    </div>
  </div>
{:else}
  <div class="rounded-lg p-1 transition-colors" class:bg-gray-800={isSelected}>
    <button
      bind:this={mediaPreview}
      on:click|capture|stopPropagation={handleClick}
      class="w-48 aspect-video rounded-md overflow-clip mb-2"
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
        <div class="overflow-clip" bind:clientWidth={containerWidth}>
          <p
            style="--overflow-scroll-pos: {nameOffset}px"
            class="relative text-neutral-200 font-mono m-0 w-max {shouldNameAnimate && 'animate'}"
            bind:clientWidth={nameWidth}
          >
            {media.metadata.title}
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .animate {
    animation: name-scroll 7.5s linear infinite alternate;
  }

  @keyframes name-scroll {
    0% {
      left: 0px;
    }
    25% {
      left: 0px;
    }
    75% {
      left: var(--overflow-scroll-pos);
    }
    100% {
      left: var(--overflow-scroll-pos);
    }
  }
</style>
