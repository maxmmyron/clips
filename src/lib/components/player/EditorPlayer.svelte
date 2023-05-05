<script lang="ts">
  import { timeline } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";
  import { onMount } from "svelte";
  import { regenerateEditorAudio } from "./audioHandler";

  export let width = 640,
    height = 480;

  let isPaused = true;
  let srcAIndex = 0,
    srcBIndex = 1;

  let trackA: HTMLVideoElement, trackB: HTMLVideoElement;
  let preview: HTMLVideoElement;
  let audioContext: AudioContext;

  onMount(() => {
    preview = trackA;
    audioContext = new AudioContext();
  });

  $: if (preview) isPaused ? preview.pause() : preview.play(); //check removal of isPaused,
  $: if (audioContext) isPaused ? audioContext.suspend() : audioContext.resume();
  $: srcA = $timeline.clips[srcAIndex]?.src;
  $: srcB = $timeline.clips[srcBIndex]?.src;
  $: currentTime = preview?.currentTime || 0;
  $: accumulatedTime = $timeline.clips.slice(0, Math.max(srcAIndex, srcBIndex)).reduce((acc, cur) => acc + cur.duration, 0);
  $: $timeline.clips && audioContext && regenerateEditorAudio(audioContext);

  const handleEnded = () => {
    if ((preview === trackA ? srcAIndex : srcBIndex) === $timeline.clips.length - 1) {
      audioContext && audioContext.suspend();
      isPaused = true;
      return;
    }

    if (preview === trackA) {
      preview = trackB;
      srcAIndex = srcBIndex + 1;
    } else {
      preview = trackA;
      srcBIndex = srcAIndex + 1;
    }
  };

  let render: Render;
  $: render = ({ context, width, height }) => {
    $t;
    if (!preview) {
      console.warn("No video to render");
      return;
    }

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
      (srcAIndex = 0), (srcBIndex = 1);
      currentTime = 0;
    } else {
      // TODO: kinda shitty code; probably should directly set src attribute of preview. Works for now but consider refactoring
      preview.src = $timeline.clips[$timeline.clips.length - 1].src;
      currentTime = preview.duration;
      if (preview === trackA) {
        srcAIndex = $timeline.clips.length - 1;
        srcBIndex = $timeline.clips.length;
      } else {
        srcAIndex = $timeline.clips.length;
        srcBIndex = $timeline.clips.length - 1;
      }
    }
  }
</script>

<video class="hidden" muted src={srcA} bind:this={trackA} on:ended={handleEnded} />
<video class="hidden" muted src={srcB} bind:this={trackB} on:ended={handleEnded} />

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
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(true)}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPaused = !isPaused)}>{isPaused ? "▶️" : "⏸️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(false)}>⏩</button>
</div>
