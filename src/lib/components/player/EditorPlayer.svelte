<script lang="ts">
  import { timeline } from "$lib/stores";
  import { onMount } from "svelte";

  let canvasPlayer: HTMLCanvasElement;
  let currentTime = 0;
  let isPaused = true;

  onMount(() => console.log("mounting"));

  $: $timeline.clips, createFrame();

  // TODO: replace
  const createFrame = () => {
    console.log("creating frame");
    if (!canvasPlayer) {
      console.log("no canvas");
      return;
    }
    if (!$timeline.clips.length) {
      console.log("no clips");
      return;
    }

    const ctx = canvasPlayer.getContext("2d");
    if (!ctx) {
      console.log("no context");
      return;
    }
    const clip = $timeline.clips[0];

    console.log(clip);

    const video = document.createElement("video");
    video.src = clip.src;
    video.currentTime = 2;

    video.addEventListener("loadeddata", () => {
      console.log("loaded data");
      ctx.fillStyle = "red";
      ctx.fillRect(0, 0, canvasPlayer.width, canvasPlayer.height);
      video.play();
      ctx.drawImage(video, 0, 0);
    });

    // console.log(video, video.src, video.currentTime);

    // ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, canvasPlayer.width, canvasPlayer.height);
    ctx.drawImage(video, 0, 0, 100, 100);
  };

  function setPlayerTime(arg0: number): any {
    throw new Error("Function not implemented.");
  }
</script>

{#if $timeline.clips.length}
  <canvas class="w-full h-full" bind:this={canvasPlayer} />
{:else}
  <div class="w-full h-full flex justify-center items-center">
    <p class="text-neutral-400 font-mono">no clips in timeline （＞人＜；）</p>
  </div>
{/if}

<p class="w-full text-white text-right">{currentTime.toPrecision(2)}</p>

<div class="w-full flex justify-center gap-4">
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(0)}>⏪</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPaused = !isPaused)}>{isPaused ? "▶️" : "⏸️"}</button>
  <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setPlayerTime(-1)}>⏩</button>
</div>
