<script lang="ts">
  import { studio, timeline } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import { onMount } from "svelte";

  export let width = 640,
    height = 480;

  let isPaused = true;
  let bufferAIndex = 0,
    bufferBIndex = 1;
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

  // TODO: expand src with video & audio srcs
  $: videoSrcA = $timeline.clips[bufferAIndex]?.src;
  $: videoSrcB = $timeline.clips[bufferBIndex]?.src;
  $: currentIndex = preview === videoA ? bufferAIndex : bufferBIndex;
  $: accumulatedTime = $timeline.clips.slice(0, Math.min(bufferAIndex, bufferBIndex)).reduce((acc, cur) => acc + cur.duration, 0);

  const handlePlay = () => {
    //create node from AudioBuffer
    audioNode = audioContext.createBufferSource();
    audioNode.buffer = $timeline.clips[currentIndex].buffer;

    const startOffset = $timeline.clips[currentIndex].startTime + preview.currentTime;
    const duration = $timeline.clips[currentIndex].duration - preview.currentTime - $timeline.clips[currentIndex].endTime;

    audioNode.connect(audioContext.destination);
    audioNode.start(0, startOffset, duration);
  };

  const handleEnded = () => {
    if ((preview === videoA ? bufferAIndex : bufferBIndex) === $timeline.clips.length - 1) {
      audioContext && audioContext.suspend();
      isPaused = true;
      return;
    }

    preview = (preview === videoA ? videoB : videoA) as HTMLVideoElement;
    // skip forward previous index to next clip
    preview === videoA ? (bufferBIndex += 2) : (bufferAIndex += 2);
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
      bufferAIndex = 0;
      bufferBIndex = 1;
      preview = videoA;
      preview.currentTime = 0;
      accumulatedTime = 0;
    } else {
      // TODO: kinda shitty code; probably should directly set src attribute of preview. Works for now but consider refactoring
      preview.src = $timeline.clips[$timeline.clips.length - 1].src;
      preview.load();
      preview.addEventListener("loadedmetadata", () => {
        preview.currentTime = preview.duration;
      });
      accumulatedTime = $timeline.clips.reduce((acc, cur) => acc + cur.duration, 0) - preview.duration;
      if (preview === videoA) {
        bufferAIndex = $timeline.clips.length - 1;
        bufferBIndex = $timeline.clips.length;
      } else {
        bufferAIndex = $timeline.clips.length;
        bufferBIndex = $timeline.clips.length - 1;
      }
    }
  }

  const togglePlayState = () => {
    if (currentIndex === $timeline.clips.length - 1 && preview.currentTime === preview.duration) setPlayerTime();
    isPaused = !isPaused;
  };
</script>

<video class="hidden" muted src={videoSrcA} bind:this={videoA} on:ended={handleEnded} on:play={handlePlay} />
<video class="hidden" muted src={videoSrcB} bind:this={videoB} on:ended={handleEnded} on:play={handlePlay} />

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
