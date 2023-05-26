<script lang="ts">
  import { timeline } from "$lib/stores";
  import { onMount } from "svelte";

  // TODO: fix this so we only accept video and image buffers.
  export let nodeUUID: string, audioContext: AudioContext;

  const node = $timeline.timeline.getByUUID(nodeUUID) as App.Node<"video" | "image">;
  const metadata = node.metadata;

  let buffer: HTMLVideoElement | HTMLImageElement;

  onMount(() => {
    $timeline.sources.set(nodeUUID, { source: buffer, type: node.type });
  });

  /**
   * The audioContext timestamp when the player was paused.
   */
  // let pauseTimestamp = 0;
  // let lastPauseState: "paused" | "playing" = "paused";
</script>

<!-- on:play={handlePlay} -->
{#if node.type === "video"}
  <video muted class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={node.src} bind:this={buffer} />
{:else}
  <img class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={node.src} bind:this={buffer} alt="" />
{/if}
