<script lang="ts">
  import { timeline, player } from "$lib/stores";
  import { onMount } from "svelte";

  export let node: TimelineLayerNode, audioContext: AudioContext;

  let video: HTMLVideoElement;
  let currentTime: number;
  let audioNode: AudioBufferSourceNode;

  $: if (audioNode) $player.isPaused && audioNode.disconnect();

  $: if (
    video &&
    video === $timeline.videos.get($timeline.curr?.uuid || "") &&
    currentTime >= video.duration - node.metadata.startOffset - node.metadata.endOffset
  ) {
    if (audioNode) audioNode.disconnect();

    if (node === $timeline.clips.tail) $player.isPaused = true;
    else $timeline.curr = node.next;
  }

  const handleBufferSetup = () => {
    currentTime = node.metadata.startOffset;
  };

  const handlePlay = () => {
    console.log("playing source");
    audioNode = audioContext.createBufferSource();

    const startOffset = Math.max(node.metadata.startOffset, node.metadata.startOffset + (currentTime - node.metadata.startOffset));

    video.currentTime = startOffset;

    const audioNodeBuffer = audioContext.createBuffer(node.metadata.audio.numberOfChannels, node.metadata.audio.length, node.metadata.audio.sampleRate);
    for (let i = 0; i < node.metadata.audio.numberOfChannels; i++) audioNodeBuffer.copyToChannel(node.metadata.audio.getChannelData(i), i);

    audioNode.buffer = audioNodeBuffer;

    const duration = node.metadata.duration - node.metadata.endOffset - startOffset;

    audioNode.connect(audioContext.destination);
    audioNode.start(0, startOffset, duration);
  };

  onMount(() => {
    console.log("mounting video buffer");
    if (!video) throw new Error("No buffer");
    $timeline.videos.set(node.uuid, video);
  });
</script>

<video muted class="hidden" bind:currentTime src={node.metadata.src} bind:this={video} on:loadedmetadata={handleBufferSetup} on:play={handlePlay} />
