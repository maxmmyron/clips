<script lang="ts">
  import { mediaPool, player, timeline } from "$lib/stores";
  import { onMount } from "svelte";
  import { isNodeVideoMedia } from "../util/helpers";

  export let nodeUUID: string, audioContext: AudioContext;

  let buffer: HTMLVideoElement | HTMLImageElement;

  const node = $timeline.timeline.getByUUID(nodeUUID) as App.Node<"video" | "image">;
  let audioNode: AudioBufferSourceNode;

  onMount(() => $timeline.sources.set(nodeUUID, { source: buffer, type: node.type }));

  // FIXME: this runs every frame due to $timeline.current === node check. not sure why?
  $: if (isNodeVideoMedia(node) && buffer && $timeline.current === node) {
    buffer = buffer as HTMLVideoElement;
    if (!$player.isPaused) {
      if (buffer.paused) {
        audioNode = audioContext.createBufferSource();
        audioNode.buffer = ($mediaPool.media.find((media) => media.uuid === node.mediaUUID) as App.VideoMedia).metadata.audio;
        audioNode.connect(audioContext.destination);
        const playTime = $timeline.currentNodeRuntime + $timeline.current.metadata.start;
        const endTime = $timeline.current.metadata.duration - $timeline.current.metadata.start - $timeline.current.metadata.end;

        buffer.currentTime = playTime;
        buffer.play();
        audioNode.start(0, playTime, endTime);
      }
    } else {
      if (!buffer.paused) {
        buffer.pause();
        if (audioNode) {
          audioNode.stop();
          audioNode.disconnect();
        }
      }
    }
  }
</script>

{#if node.type === "video"}
  <video muted class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={node.src} bind:this={buffer} />
{:else}
  <img class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={node.src} bind:this={buffer} alt="" />
{/if}
