<script lang="ts">
  import { buffers, media, player, timeline } from "$lib/stores";
  import { onMount } from "svelte";

  export let nodeUUID: string, audioContext: AudioContext;

  let buffer: HTMLVideoElement | HTMLImageElement;

  $: node = $timeline.clips.getByUUID(nodeUUID) as App.Node;
  let audioNode: AudioBufferSourceNode;
  let hasAudioNodeStarted = false;

  onMount(() => node.type !== "audio" && $buffers.set(nodeUUID, { source: buffer, type: node.type }));

  // FIXME: this runs every frame due to $timeline.current === node check. not sure why?
  $: if (buffer && $timeline.current === node) {
    if (node.type === "video") {
      buffer = buffer as HTMLVideoElement;
      if (!$player.isPaused && buffer.paused) {
        audioNode = audioContext.createBufferSource();
        audioNode.buffer = ($media.resolved.find((media) => media.uuid === node.mediaUUID) as App.Video).metadata.audio;
        audioNode.connect(audioContext.destination);
        const playTime = $timeline.currentNodeRuntime + $timeline.current.metadata.start;
        const endTime = $timeline.current.metadata.duration - $timeline.current.metadata.start - $timeline.current.metadata.end;

        buffer.currentTime = playTime;
        buffer.play();
        audioNode.start(0, playTime, endTime);
      } else if ($player.isPaused && !buffer.paused) {
        buffer.pause();
        if (audioNode) {
          audioNode.stop();
          audioNode.disconnect();
        }
      }
    }

    if (node.type === "audio") {
      if (!$player.isPaused && !hasAudioNodeStarted) {
        audioNode = audioContext.createBufferSource();
        audioNode.buffer = ($media.resolved.find((media) => media.uuid === node.mediaUUID) as App.Audio).metadata.audio;
        audioNode.connect(audioContext.destination);
        const playTime = $timeline.currentNodeRuntime + $timeline.current.metadata.start;
        const endTime = $timeline.current.metadata.duration - $timeline.current.metadata.start - $timeline.current.metadata.end;

        audioNode.start(0, playTime, endTime);
        hasAudioNodeStarted = true;
      } else if ($player.isPaused && hasAudioNodeStarted) {
        audioNode.stop();
        audioNode.disconnect();
        hasAudioNodeStarted = false;
      }
    }
  }
</script>

{#if node.type === "video"}
  <video muted class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={node.src} bind:this={buffer} />
{:else}
  <img class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={node.src} bind:this={buffer} alt="" />
{/if}
