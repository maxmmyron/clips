<script lang="ts">
  import { buffers, media, player, timeline, audioContext } from "$lib/stores";
  import { onMount } from "svelte";

  export let clip: App.Clip;

  let buffer: HTMLVideoElement | HTMLImageElement;

  let audioNode: AudioBufferSourceNode;
  let hasAudioNodeStarted = false;

  onMount(() => clip.type !== "audio" && $buffers.set(clip.uuid, { source: buffer, type: clip.type }));

  // FIXME: this runs every frame due to $timeline.current === node check. not sure why?
  $: if ((clip.type === "video" || clip.type === "image") && $timeline.current.video === clip) {
    buffer = buffer as HTMLVideoElement;
    if (!$player.isPaused && buffer.paused) {
      audioNode = $audioContext.createBufferSource();
      audioNode.buffer = ($media.resolved.find((media) => media.uuid === clip.mediaUUID) as App.Video).metadata.audio;
      audioNode.connect($audioContext.destination);
      const playTime = $timeline.clipRuntime + $timeline.current.video.metadata.start;
      const endTime = $timeline.current.video.metadata.duration - $timeline.current.video.metadata.start - $timeline.current.video.metadata.end;

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

  $: if(clip.type === "audio" && $timeline.current.audio === clip) {
    if (!$player.isPaused && !hasAudioNodeStarted) {
      audioNode = $audioContext.createBufferSource();
      audioNode.buffer = ($media.resolved.find((media) => media.uuid === clip.mediaUUID) as App.Audio).metadata.audio;
      audioNode.connect($audioContext.destination);
      const playTime = $timeline.clipRuntime + $timeline.current.audio.metadata.start;
      const endTime = $timeline.current.audio.metadata.duration - $timeline.current.audio.metadata.start - $timeline.current.audio.metadata.end;

      audioNode.start(0, playTime, endTime);
      hasAudioNodeStarted = true;
    } else if ($player.isPaused && hasAudioNodeStarted) {
      audioNode.stop();
      audioNode.disconnect();
      hasAudioNodeStarted = false;
    }
  }
</script>

{#if clip.type === "video"}
  <video muted class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={clip.src} bind:this={buffer} />
{:else if clip.type === "image"}
  <img class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={clip.src} bind:this={buffer} alt="" />
{/if}
