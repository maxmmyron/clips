<script lang="ts">
  import "../app.css";

  let isPlaying = false;
  let isMediaPoolVisible = false;
  let video: HTMLVideoElement | null = null;
  // TODO: support multiple files
  let files: FileList | null = null;

  $: if (video && isPlaying) video.play();
  $: if (video && !isPlaying) video.pause();

  const setVideoTime = (time: number) => {
    if (!video) throw new Error("Video element not found");

    video.pause();
    video.currentTime = time === -1 ? video.duration : time;
  };
</script>

<main class="w-full h-[100dvh] bg-neutral-950 grid grid-cols-1 grid-rows-[1fr,minmax(30vh,512px)]">
  <div class="grid grid-cols-1 2xl:grid-cols-[minmax(384px,20vw),1fr] grid-rows-1 relative">
    <div class="border-2 border-neutral-800 absolute 2xl:relative flex flex-col transition {isMediaPoolVisible ? 'h-1/2' : ''}">
      <input type="file" accept="video/*" class="text-white border-2 border-neutral-800 px-3 py-1" bind:files />
      <div class="w-full border-2 border-neutral-800 flex-1">
        <p class="text-white">media pool</p>
      </div>
      <button class="2xl:hidden block w-full text-white text-center" on:click={() => (isMediaPoolVisible = !isMediaPoolVisible)}>
        {isMediaPoolVisible ? "hide" : "show"} media pool
      </button>
    </div>
    <div class="flex flex-col gap-6 justify-center items-center border-2 border-neutral-800">
      <p class="text-white">video</p>
      <video class="aspect-video max-w-7xl max-h-1/2 border-2 border-neutral-600" bind:this={video}>
        {#if files}
          <source src={URL.createObjectURL(files[0])} type={files[0].type} />
        {/if}
        <track kind="captions" />
      </video>
      <div class="w-100 flex justify-center gap-4">
        <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setVideoTime(0)}>beginning</button>
        <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPlaying = !isPlaying)}>{isPlaying ? "pause" : "play"}</button>
        <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => setVideoTime(-1)}>end</button>
      </div>
    </div>
  </div>
  <div class="w-full h-full grid grid-cols-[minmax(256px,20vw),1fr] grid-rows-1">
    <div class="border-2 border-neutral-800">
      <p class="text-white">timeline</p>
    </div>
    <div class="border-2 border-neutral-800">
      <p class="text-white">scrubber</p>
      <!-- TODO: implement scrubber -->
    </div>
  </div>
</main>
