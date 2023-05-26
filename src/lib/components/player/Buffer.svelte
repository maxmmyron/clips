<script lang="ts">
  import { timeline } from "$lib/stores";
  import { onMount } from "svelte";
  export let nodeUUID: string;

  const node = $timeline.timeline.getByUUID(nodeUUID) as App.Node<"video" | "image">;

  let buffer: HTMLVideoElement | HTMLImageElement;

  onMount(() => {
    $timeline.sources.set(nodeUUID, { source: buffer, type: node.type });
  });
</script>

<!-- on:play={handlePlay} -->
{#if node.type === "video"}
  <video muted class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={node.src} bind:this={buffer} />
{:else}
  <img class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={node.src} bind:this={buffer} alt="" />
{/if}
