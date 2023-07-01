<script lang="ts">
  import { player, draggable } from "$lib/stores";
  import Icon from "../util/Icon.svelte";
  import Marquee from "../util/Marquee.svelte";

  export let media: App.Media;
  export let selected = [];

  let mediaPreview: HTMLButtonElement;

  $: isSelected = media ? selected.includes(media.uuid) : false;

  const handleClick = (e: MouseEvent) => {
    if (!media) return;
    if (e.detail == 2) $player.source = media.src;
    else if (e.shiftKey) selected = [...selected, media.uuid];
    else selected = [media.uuid];
  };

  const handleDragStart = (e: MouseEvent) => {
    $draggable = {
      ...$draggable,
      mediaUUID: media.uuid,
      origin: {
        pos: { x: e.clientX, y: e.clientY },
        region: "media_pool",
      },
      event: "start",
      region: null,
    };

    $draggable.ghost.pos.set({ x: $studio.mouse.x, y: $studio.mouse.y }, { hard: true });
    $draggable.ghost.size.set(
      { width: mediaPreview.getBoundingClientRect().width, height: mediaPreview.getBoundingClientRect().height },
      { hard: true }
    );
  };
</script>

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
      <Icon src="/icons/{media.type}.svg" />
      <Marquee isSecondaryColor={isSelected}>{media.metadata.title}</Marquee>
    </div>
  </div>
</div>
