<script lang="ts">
  import { studio, timeline } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import { onMount } from "svelte";
  import PreviewPlayer from "./PreviewPlayer.svelte";

  export let width = 640,
    height = 480;

  let isPaused = true;
  let bufferAIdx = 0,
    bufferBIdx = 1;
  let currentTime = 0;

  let videoA: HTMLVideoElement, videoB: HTMLVideoElement, preview: HTMLVideoElement;
  let audioContext: AudioContext, audioNode: AudioBufferSourceNode;

  onMount(() => {
    preview = videoA;
    audioContext = new AudioContext();
  });

  $: if (preview) isPaused ? preview.pause() : preview.play();
  $: if (audioContext) isPaused ? audioContext.suspend() : audioContext.resume();
  $: if (audioNode) isPaused && audioNode && audioNode.disconnect();

  $: videoSrcA = $timeline.clips[bufferAIdx]?.src;
  $: videoSrcB = $timeline.clips[bufferBIdx]?.src;
  $: accumulatedTime = $timeline.clips.slice(0, Math.min(bufferAIdx, bufferBIdx)).reduce((acc, cur) => acc + (cur.duration - cur.startTime - cur.endTime), 0);
  $: currentMetadata = $timeline.clips[preview === videoA ? bufferAIdx : bufferBIdx];

  const handlePlay = () => {
    if (!preview) throw new Error("No preview to play");

    audioNode = audioContext.createBufferSource();
    const audioNodeBuffer = audioContext.createBuffer(
      currentMetadata.buffer.numberOfChannels,
      currentMetadata.buffer.length,
      currentMetadata.buffer.sampleRate
    );

    for (let i = 0; i < currentMetadata.buffer.numberOfChannels; i++) {
      audioNodeBuffer.copyToChannel(currentMetadata.buffer.getChannelData(i), i);
    }

    audioNode.buffer = audioNodeBuffer;

    const startOffset = currentMetadata.startTime + (preview.currentTime - currentMetadata.startTime);
    const duration = currentMetadata.duration - currentMetadata.endTime - startOffset;

    audioNode.connect(audioContext.destination);
    audioNode.start(0, startOffset, duration);
    audioNode.addEventListener("ended", handleEnded);
  };

  const handleEnded = () => {
    if ((preview === videoA ? bufferAIdx : bufferBIdx) === $timeline.clips.length - 1) {
      audioContext && audioContext.suspend();
      isPaused = true;
      return;
    }

    audioNode.disconnect();

    preview = (preview === videoA ? videoB : videoA) as HTMLVideoElement;
    // skip forward previous index to next clip
    preview === videoA ? (bufferBIdx += 2) : (bufferAIdx += 2);

    const startTime = preview === videoA ? $timeline.clips[bufferAIdx].startTime : $timeline.clips[bufferBIdx].startTime;

    preview.currentTime = startTime;
  };

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if (!preview) {
      console.warn("No video to render");
      return;
    }

    // TODO: not good svelte code... this could be reactive
    currentTime = preview.currentTime;

    // TODO: no need to recompute this every frame
    const mediaSize = {
      width: preview.videoWidth * Math.min(width / preview.videoWidth, height / preview.videoHeight),
      height: preview.videoHeight * Math.min(width / preview.videoWidth, height / preview.videoHeight),
    };

    const mediaPosition: [number, number] = [Math.max(0, (width - mediaSize.width) / 2), Math.max(0, (height - mediaSize.height) / 2)];

    context.drawImage(preview, 0, 0, preview.videoWidth, preview.videoHeight, ...mediaPosition, mediaSize.width, mediaSize.height);
  };

  function setPlayerTime(front: boolean = true): any {
    isPaused = true;
    if (front) {
      bufferAIdx = 0;
      bufferBIdx = 1;
      preview = videoA;
      preview.currentTime = currentMetadata.startTime;
      accumulatedTime = 0;
    } else {
      // TODO: kinda shitty code; probably should directly set src attribute of preview. Works for now but consider refactoring
      preview.src = $timeline.clips[$timeline.clips.length - 1].src;
      preview.load();
      let lastDuration = preview.duration - $timeline.clips[$timeline.clips.length - 1].startTime;
      preview.addEventListener("loadedmetadata", () => (preview.currentTime = lastDuration));
      accumulatedTime = $timeline.clips.reduce((acc, cur) => acc + (cur.duration - cur.startTime - cur.endTime), 0) - lastDuration;

      if (preview === videoA) {
        bufferAIdx = $timeline.clips.length - 1;
        bufferBIdx = $timeline.clips.length;
      } else {
        bufferAIdx = $timeline.clips.length;
        bufferBIdx = $timeline.clips.length - 1;
      }
    }
  }

  const togglePlayState = () => {
    const currentIndex = preview === videoA ? bufferAIdx : bufferBIdx;
    if (currentIndex === $timeline.clips.length - 1 && preview.currentTime === preview.duration) setPlayerTime();
    isPaused = !isPaused;
  };
</script>

<video class="hidden" muted src={videoSrcA} bind:this={videoA} on:play={handlePlay} />
<video class="hidden" muted src={videoSrcB} bind:this={videoB} on:play={handlePlay} />

<div class="w-full h-full flex justify-center items-center">
  {#if $timeline.clips.length}
    <Canvas {width} {height}>
      <Layer {render} />
    </Canvas>
  {:else}
    <p class="text-neutral-400 font-mono">no clips in timeline （＞人＜；）</p>
  {/if}
</div>

<p class="w-full text-white text-right">{(accumulatedTime + currentTime).toPrecision(2)}</p>

<div class="w-full flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime()}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={togglePlayState}>{isPaused ? "▶️" : "⏸️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(false)}>⏩</button>
</div>
