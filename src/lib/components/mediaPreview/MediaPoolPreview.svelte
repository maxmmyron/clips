<script lang="ts">
  import { player, studio, mediaPool } from "$lib/stores";

  export let metadata: UploadedMedia;

  let mediaPreview: HTMLButtonElement;
  let containerWidth: number, nameWidth: number;

  $: isSelected = $mediaPool.selected.includes(metadata);
  $: shouldNameAnimate = nameWidth > containerWidth;
  $: nameOffset = containerWidth - nameWidth - 16;

  const handleClick = (e: MouseEvent) => {
    if (e.detail == 2) $player.source = metadata.src;
    else if (e.shiftKey) $mediaPool.selected = [...$mediaPool.selected, metadata];
    else $mediaPool.selected = [metadata];
  };

  const handleDragStart = (e: MouseEvent) => {
    $studio.dragData = {
      ...$studio.dragData,
      media: metadata,
      originType: "mediaPool",
      originPosition: { x: e.clientX, y: e.clientY },
      dragEvent: "dragstart",
      currentDragRegion: null,
    };

    $studio.dragData.ghost.position.set({ x: mediaPreview.getBoundingClientRect().x, y: mediaPreview.getBoundingClientRect().y }, { hard: true });
    $studio.dragData.ghost.size.set({ width: mediaPreview.getBoundingClientRect().width, height: mediaPreview.getBoundingClientRect().height }, { hard: true });
  };
</script>

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
      {metadata.name}
    </p>
  </div>
</button>

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
