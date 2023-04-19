<script lang="ts">
  import "../app.css";

  let isPlaying = false;

  let files: FileList | null = null;
  $: file = files && files[0];
</script>

<main class="w-full h-[100dvh] bg-neutral-950 grid grid-cols-1 grid-rows-[70vh,30vh]">
  <div class="p-8">
    <div class="d-flex gap-4">
      <input type="file" accept="video/*" class="text-white border-2 border-neutral-800 px-3 py-1" bind:files />
    </div>
    <video class="aspect-video mx-auto border-2 border-neutral-800 max-h-full" controls={file !== null}>
      {#if file}
        <source src={URL.createObjectURL(file)} type={file.type} />
      {/if}
      <track kind="captions" />
    </video>
  </div>
  <div class="m-8 border-2 border-neutral-800">
    <div class="d-flex gap-4">
      <button class="text-white border-2 border-neutral-800 px-3 py-1">beginning</button>
      <button class="text-white border-2 border-neutral-800 px-3 py-1" on:click={() => (isPlaying = !isPlaying)}>{isPlaying ? "pause" : "play"}</button>
      <button class="text-white border-2 border-neutral-800 px-3 py-1">end</button>
    </div>
  </div>
</main>
