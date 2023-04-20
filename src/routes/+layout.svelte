<script lang="ts">
  import "../app.css";

  let isPlaying = false;
  let video: HTMLVideoElement | null = null;

  $: if (video && isPlaying) video.play();
  $: if (video && !isPlaying) video.pause();

  const setVideoTime = (time: number) => {
    if (!video) throw new Error("Video element not found");

    video.pause();
    video.currentTime = time === -1 ? video.duration : time;
  };

  // TODO: support multiple files
  let files: FileList | null = null;
</script>

<!-- TODO: update grid design (+ responsive) -->
<main class="w-full h-[100dvh] bg-neutral-950 grid grid-cols-1 grid-rows-[70vh,30vh]">
  <!-- TODO: add media pool -->
  <div class="p-8">
    <div class="d-flex gap-4">
      <input type="file" accept="video/*" class="text-white border-2 border-neutral-800 px-3 py-1" bind:files />
    </div>
    <video class="aspect-video mx-auto border-2 border-neutral-800 max-h-full" bind:this={video}>
      {#if files}
        <source src={URL.createObjectURL(files[0])} type={files[0].type} />
      {/if}
      <track kind="captions" />
    </video>
  </div>
  <div class="border-2 border-neutral-800">
    <!-- TODO: move to video area -->
    <div class="w-100 flex justify-center gap-4">
      <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setVideoTime(0)}>beginning</button>
      <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPlaying = !isPlaying)}>{isPlaying ? "pause" : "play"}</button>
      <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setVideoTime(-1)}>end</button>
    </div>
    <!-- TODO: implement scrubber -->
    <div />
  </div>
</main>
