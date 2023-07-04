<script lang="ts">
  import { studio, player, draggable, media } from "$lib/stores";
  import Icon from "../util/Icon.svelte";
  import LoadIcon from "../util/LoadIcon.svelte";
  import Marquee from "../util/Marquee.svelte";
  import MediaAudioPreview from "./MediaAudioPreview.svelte";
  import MediaVideoPreview from "./MediaVideoPreview.svelte";

  export let unresolved: Promise<App.Media>;
  export let uuid: string;
  export let name: string;

  export let selected: string[] = [];

  let mediaPreview: HTMLButtonElement;

  $: isSelected = selected.includes(uuid);

  const handleSelection = async (e: MouseEvent, media: App.Media) => {
    if (e.detail == 2) $player.source = media.src;
    else if (e.shiftKey) selected = [...selected, media.uuid];
    else selected = [media.uuid];
  };

  const handleRemoval = (e: MouseEvent) => {
    e.stopPropagation();
    $media.unresolved = $media.unresolved.filter((m) => m.uuid != uuid);
  };

  const handleDragStart = (e: MouseEvent, media: App.Media) => {
    $draggable = {
      ...$draggable,
      media,
      origin: {
        pos: { x: e.clientX, y: e.clientY },
        region: "media_pool",
      },
      event: "start",
      region: null,
    };

    $draggable.ghost.pos.set({ x: $studio.mouse.x, y: $studio.mouse.y }, { hard: true });
    $draggable.ghost.size.set({ width: mediaPreview.getBoundingClientRect().width, height: mediaPreview.getBoundingClientRect().height }, { hard: true });
  };
</script>

<div class="rounded-lg p-1 transition-colors" class:bg-gray-800={isSelected}>
  {#await unresolved}
    <div class="w-48 aspect-video rounded-md overflow-clip mb-2 bg-black">
      <p class="text-white">Loading...</p>
    </div>
  {:then resolved}
    <button
      bind:this={mediaPreview}
      on:click|capture|stopPropagation={(e) => handleSelection(e, resolved)}
      class="w-48 aspect-video rounded-md overflow-clip mb-2 bg-black"
      on:mousedown={(e) => handleDragStart(e, resolved)}
    >
      {#if resolved.type === "video" || resolved.type === "image"}
        <MediaVideoPreview mediaUUID={uuid} />
      {:else if resolved.type === "audio"}
        <MediaAudioPreview mediaUUID={uuid} metadata={{ start: 0, end: 0 }} />
      {/if}
    </button>
  {:catch error}
    <button bind:this={mediaPreview} on:click|capture|stopPropagation={handleRemoval} class="w-48 aspect-video rounded-md overflow-clip mb-2 bg-black">
      <p class="text-red-200">{error}</p>
    </button>
  {/await}
  <div class="relative">
    <div
      class="w-48 overflow-clip grid grid-rows-1 grid-cols-[24px,auto] gap-1 items-center after:content-[''] after:w-5 after:h-full after:absolute after:top-0 after:right-0 after:bg-gradient-to-l after:from-{isSelected
        ? 'gray-800'
        : 'neutral-900'} after:to-transparent"
    >
      {#await unresolved}
        <LoadIcon />
      {:then { type }}
        <Icon src="/icons/{type}.svg" />
      {/await}
      <Marquee isSecondaryColor={isSelected}>{name}</Marquee>
    </div>
  </div>
</div>
