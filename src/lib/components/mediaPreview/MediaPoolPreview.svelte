<script lang="ts">
  import { player, studio, mediaPool } from "$lib/stores";

  export let metadata: UploadedMedia;

  let duration = metadata.duration;

  let width = "12rem";

  let mediaPreview: HTMLButtonElement;

  $: isSelected = $mediaPool.selected.includes(metadata);

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
  style="width: {width};"
  on:click|capture|stopPropagation={handleClick}
  class="relative flex flex-col outline-2 outline-blue-600 w-48 rounded-md overflow-clip aspect-video"
  class:outline={isSelected}
  on:mousedown={handleDragStart}
>
  <slot />
</button>
