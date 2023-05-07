<script lang="ts">
  import { studio, player } from "$lib/stores";
  import EditorPlayer from "./EditorPlayer.svelte";
  import PreviewPlayer from "./PreviewPlayer.svelte";

  let videoContainer: HTMLDivElement | null = null;

  const handleDrag = () => {
    if (!$studio.dragData || $studio.dragData.dragEvent !== "drag" || !videoContainer) return;

    $studio.dragData.ghost.position.set({ x: videoContainer.getBoundingClientRect().x, y: videoContainer.getBoundingClientRect().y });
    $studio.dragData.ghost.size.set({ width: videoContainer.getBoundingClientRect().width, height: videoContainer.getBoundingClientRect().height });
  };

  const handleDrop = (e: MouseEvent) => {
    if (!$studio.dragData.media) return;
    $player.source = $studio.dragData.media.src;
    $player.playerState = "preview";
  };
</script>

<div>
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1"
    class:bg-neutral-600={$player.playerState === "editor"}
    on:click={() => ($player.playerState = "editor")}>editor</button
  >
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1"
    class:bg-neutral-600={$player.playerState === "preview"}
    on:click={() => ($player.playerState = "preview")}
    class:opacity-75={!$player.source}
    disabled={!$player.source}>preview</button
  >
</div>

<div
  class="aspect-video w-full max-w-[50%]"
  bind:this={videoContainer}
  on:mouseup={handleDrop}
  on:mousemove={handleDrag}
  on:mouseenter={() => ($studio.dragData.currentDragRegion = "player")}
  on:mouseleave={() => ($studio.dragData.currentDragRegion = null)}
>
  {#key $player.source}
    {#if $player.playerState === "editor"}
      <EditorPlayer width={videoContainer?.clientWidth || 640} height={videoContainer?.clientHeight || 480} />
    {:else}
      <PreviewPlayer />
    {/if}
  {/key}
</div>
