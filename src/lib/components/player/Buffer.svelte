<script lang="ts">
  import { buffers, media, player, timeline, audioContext } from "$lib/stores";
  import { onMount } from "svelte";

  export let clip: App.Clip;

  let buffer: HTMLVideoElement | HTMLImageElement;

  let audioNode: AudioBufferSourceNode;
  let hasAudioNodeStarted = false;

  onMount(() => clip.type !== "audio" && $buffers.set(clip.uuid, { source: buffer, type: clip.type }));

  // FIXME: this runs every frame due to $timeline.current === node check. not sure why?
  $: if (buffer && $timeline.current === clip) {
    if (clip.type === "video") {
      buffer = buffer as HTMLVideoElement;
      if (!$player.isPaused && buffer.paused) {
        audioNode = $audioContext.createBufferSource();
        audioNode.buffer = ($media.resolved.find((media) => media.uuid === clip.mediaUUID) as App.Video).metadata.audio;
        audioNode.connect($audioContext.destination);
        const playTime = $timeline.clipRuntime + $timeline.current.metadata.start;
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

    if (clip.type === "audio") {
      if (!$player.isPaused && !hasAudioNodeStarted) {
        audioNode = $audioContext.createBufferSource();
        audioNode.buffer = ($media.resolved.find((media) => media.uuid === clip.mediaUUID) as App.Audio).metadata.audio;
        audioNode.connect($audioContext.destination);
        const playTime = $timeline.clipRuntime + $timeline.current.metadata.start;
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

{#if clip.type === "video"}
  <video muted class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={clip.src} bind:this={buffer} />
{:else if clip.type === "image"}
  <img class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={clip.src} bind:this={buffer} alt="" />
{/if}
