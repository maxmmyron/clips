<script lang="ts">
  import { studio, player } from "$lib/stores";
  import EditorPlayer from "./EditorPlayer.svelte";
  import PreviewPlayer from "./PreviewPlayer.svelte";

  let videoContainer: HTMLDivElement | null = null;
  let width: number | null = null;
  let height: number | null = null;

  const handleDrag = () => {
    if ($studio.draggable.event !== "drag" || !videoContainer) return;

    $studio.draggable.ghost.pos.set({ x: videoContainer.getBoundingClientRect().x, y: videoContainer.getBoundingClientRect().y });
    $studio.draggable.ghost.size.set({ width: videoContainer.getBoundingClientRect().width, height: videoContainer.getBoundingClientRect().height });
  };

  const handleDrop = (e: MouseEvent) => {
    if (!$studio.draggable.media) return;
    $player.source = $studio.draggable.media.src;
    $player.isSinglePreview = true;
  };
</script>

<div>
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1"
    class:bg-neutral-600={$player.isSinglePreview === false}
    on:click={() => ($player.isSinglePreview = false)}>editor</button
  >
  <button
    class="text-white border-2 border-neutral-800 px-3 py-1"
    class:bg-neutral-600={$player.isSinglePreview === true}
    on:click={() => ($player.isSinglePreview = true)}
    class:opacity-75={!$player.source}
    disabled={!$player.source}>preview</button
  >
</div>

<div
  class="aspect-video w-full max-w-[75%]"
  bind:this={videoContainer}
  bind:clientWidth={width}
  bind:clientHeight={height}
  on:mouseup={handleDrop}
  on:mousemove={handleDrag}
  on:mouseenter={() => ($studio.draggable.current.region = "player")}
  on:mouseleave={() => ($studio.draggable.current.region = null)}
>
  {#key $player.source}
    {#if $player.isSinglePreview === false}
      <div class="flex">
        <p contenteditable class="text-neutral-200 w-min font-mono" bind:innerText={$studio.exportName}>untitled</p>
        <p class="text-neutral-200 font-mono">.mp4</p>
      </div>
      <EditorPlayer width={width || 640} height={height || 480} />
    {:else}
      <!-- TODO: add preview media name -->
      <PreviewPlayer />
    {/if}
  {/key}
</div>
