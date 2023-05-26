<script lang="ts">
  import { timeline } from "$lib/stores";

  // TODO: fix this so we only accept video and image buffers.
  export let nodeUUID: string, audioContext: AudioContext;

  const node = $timeline.timeline.getByUUID(nodeUUID) as App.Node;
  const metadata = node.metadata;

  let video: HTMLVideoElement, image: HTMLImageElement, audioNode: AudioBufferSourceNode | undefined;

  /**
   * The audioContext timestamp when the player was paused.
   */
  let pauseTimestamp = 0;
  let lastPauseState: "paused" | "playing" = "paused";
</script>

<!-- on:play={handlePlay} -->
<video muted class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={node.src} bind:this={video} />
