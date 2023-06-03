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
  <div class="relative flex flex-col w-48 rounded-md overflow-clip aspect-video">
    <p class="text-gray-400">{currentLoadState}</p>

    <div class="absolute py-1 px-2 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm w-full bottom-0 overflow-clip" bind:clientWidth={containerWidth}>
      <p style="--overflow-scroll-pos: {nameOffset}px" class="relative text-white m-0 w-max {shouldNameAnimate && 'animate'}" bind:clientWidth={nameWidth}>
        {name}
      </p>
    </div>
  </div>
{:else}
  <button
    bind:this={mediaPreview}
    on:click|capture|stopPropagation={handleClick}
    class="relative flex flex-col outline-2 outline-blue-600 w-48 rounded-md overflow-clip aspect-video"
    class:outline={isSelected}
    on:mousedown={handleDragStart}
  >
    <slot />
    <div class="absolute py-1 px-2 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm w-full bottom-0 overflow-clip" bind:clientWidth={containerWidth}>
      <p style="--overflow-scroll-pos: {nameOffset}px" class="relative text-white m-0 w-max {shouldNameAnimate && 'animate'}" bind:clientWidth={nameWidth}>
        {media.metadata.title}
      </p>
    </div>
  </button>
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
