<script lang="ts">
  import { player, timeline } from "$lib/stores";
  import { onMount } from "svelte";

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

  // handle video playback if dealing with video el
  // $: if (node === $timeline.current && video) !$player.isPaused ? video.play() : video.pause();

  // TODO: test
  $: if (node === $timeline.current && video) video.style.rotate = `${30}deg`;
  $: if (node !== $timeline.current && video) video.style.rotate = `${0}deg`;
  // $: if (audioNode && $player.isPaused) audioNode.disconnect();
  // $: if (node === $timeline.current && $player.isPaused && lastPauseState === "playing") {
  //   lastPauseState = "paused";
  //   pauseTimestamp = metadata.hasStarted ? audioContext.currentTime : 0;
  // }

  // $: if (metadata.runtime >= metadata.duration - metadata.offsets[1] - metadata.offsets[0] && node.uuid == $timeline.curr?.uuid) {
  //   console.log(`${node.metadata.name} ended: ${metadata.runtime} >= ${metadata.duration - metadata.offsets[1] - metadata.offsets[0]}`);
  //   audioNode && audioNode.disconnect();
  //   if (node.uuid === $timeline.clips.tail?.uuid) $player.isPaused = true;
  //   else $timeline.curr = node.next;
  //   metadata.hasEnded = true;
  // }

  // const handlePlay = () => {
  //   audioNode = audioContext.createBufferSource();

  //   if (metadata.type === MediaType.VIDEO) {
  //     const audioNodeBuffer = audioContext.createBuffer(metadata.audio.numberOfChannels, metadata.audio.length, metadata.audio.sampleRate);
  //     for (let i = 0; i < metadata.audio.numberOfChannels; i++) audioNodeBuffer.copyToChannel(metadata.audio.getChannelData(i), i);
  //     audioNode.buffer = audioNodeBuffer;
  //   } else audioNode.buffer = audioContext.createBuffer(1, metadata.duration * 44100, 44100);

  //   lastPauseState = "playing";
  //   metadata.hasStarted = true;

  //   let startOffset = metadata.offsets[0] + metadata.runtime;
  //   if (!metadata.hasStarted) metadata.initialTimestamp = audioContext.currentTime;
  //   else metadata.pauseAccumulator += audioContext.currentTime - pauseTimestamp - metadata.initialTimestamp;

  //   audioNode.connect(audioContext.destination);
  //   audioNode.start(0, startOffset, metadata.duration - metadata.offsets[1] - startOffset);

  //   console.log(`playing ${node.metadata.name} at ${startOffset} for ${metadata.duration - metadata.offsets[1] - startOffset}`);
  // };

  // onMount(() => {
  //   if (!video && !image) throw new Error("No buffer to mount.");
  //   $timeline.buffers.set(node.uuid, video || image);

  //   node.metadata.setMediaTime = (time: number) => {
  //     if (video) video.currentTime = time;
  //     audioNode?.disconnect();
  //     pauseTimestamp = 0;
  //   };
  // });
</script>

<!-- on:play={handlePlay} -->
<video muted class="pointer-events-none opacity-[0.000000001] fixed top-0 left-0" src={node.src} bind:this={video} />
