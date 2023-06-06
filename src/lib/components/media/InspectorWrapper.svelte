<script>
  import { mediaPool } from "$lib/stores";
  import MediaVideoPreview from "../preview/MediaVideoPreview.svelte";
  import MediaAudioPreview from "../preview/MediaAudioPreview.svelte";
  import { isVideoMedia } from "$lib/util/helpers";

  let current = 0;
  $: current = Math.max(0, Math.min(current, $mediaPool.selected.length - 1));
  $: currentMedia = $mediaPool.media.find((m) => m.uuid === $mediaPool.selected[current]);
</script>

{#if currentMedia}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <section on:click|stopPropagation class="w-full h-full p-4 flex flex-col">
    <header>
      <div class="flex justify-between">
        <button class="font-mono text-neutral-200" on:click={() => (current -= 1)}>{"<"}</button>
        <p class="font-mono text-neutral-200">{current + 1} / {$mediaPool.selected.length}</p>
        <button class="font-mono text-neutral-200" on:click={() => (current += 1)}>{">"}</button>
      </div>
      {#key currentMedia}
        <div class="w-full aspect-video my-2 rounded-sm overflow-clip">
          {#if currentMedia.type === "video"}
            <MediaVideoPreview mediaUUID={currentMedia.uuid} />
          {:else if currentMedia.type === "image"}
            <div class="w-full h-full bg-neutral-400">
              <img src={currentMedia.src} alt={currentMedia.metadata.title} class="w-full h-full object-fit select-none" draggable="false" />
            </div>
          {:else if currentMedia.type === "audio"}
            <MediaAudioPreview mediaUUID={currentMedia.uuid} metadata={{ start: 0, end: 0 }} />
          {/if}
        </div>
        <p class="font-mono text-neutral-200">{currentMedia?.metadata.title}</p>
      {/key}
    </header>
    <main class="mt-4 border-neutral-600 border-dashed">
      {#key currentMedia}
        <div class="flex justify-between">
          <p class="font-mono text-neutral-200">duration:</p>
          {#if isVideoMedia(currentMedia)}
            <p class="font-mono text-neutral-200">{currentMedia.metadata.duration}</p>
          {:else}
            <p class="font-mono text-neutral-200">N/A</p>
          {/if}
        </div>
      {/key}
    </main>
  </section>
{/if}
