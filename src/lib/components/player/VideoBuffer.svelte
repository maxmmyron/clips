<script lang="ts">
  import { timeline, player } from "$lib/stores";
  import { onMount } from "svelte";

  export let node: TimelineLayerNode, audioContext: AudioContext;

  let video: HTMLVideoElement;
  let currentTime: number = 0;
  let audioNode: AudioBufferSourceNode;

  $: if (audioNode) $player.isPaused && audioNode.disconnect();
  $: if (node === $timeline.curr && video) !$player.isPaused ? video.play() : video.pause();

  $: if (
    video &&
    video === $timeline.videos.get($timeline.curr?.uuid || "") &&
    currentTime >= video.duration - node.metadata.startOffset - node.metadata.endOffset
  ) {
    if (audioNode) audioNode.disconnect();
    if (node === $timeline.clips.tail) $player.isPaused = true;
    else $timeline.curr = node.next;
    node.metadata.hasEnded = true;
  }

  const handlePlay = () => {
    audioNode = audioContext.createBufferSource();

    const audioNodeBuffer = audioContext.createBuffer(node.metadata.audio.numberOfChannels, node.metadata.audio.length, node.metadata.audio.sampleRate);
    for (let i = 0; i < node.metadata.audio.numberOfChannels; i++) audioNodeBuffer.copyToChannel(node.metadata.audio.getChannelData(i), i);

    audioNode.buffer = audioNodeBuffer;

    let startOffset = node.metadata.startOffset;
    // if video has started, then resume from initial position
    if (node.metadata.hasStarted) startOffset = node.metadata.startOffset + (currentTime - node.metadata.startOffset);

    console.log(`playing from ${startOffset} to ${node.metadata.duration - node.metadata.endOffset - startOffset}`);

    currentTime = startOffset;
    node.metadata.hasStarted = true;
    const duration = node.metadata.duration - node.metadata.endOffset - startOffset;
    audioNode.connect(audioContext.destination);
    audioNode.start(0, startOffset, duration);
  };

  onMount(() => {
    if (!video) throw new Error("No buffer");
    $timeline.videos.set(node.uuid, video);
  });
</script>

<video muted class="pointer-events-none opacity-0 absolute" bind:currentTime src={node.metadata.src} bind:this={video} on:play={handlePlay} />
