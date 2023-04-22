<script lang="ts">
  import MediaPoolElement from "./MediaPoolElement.svelte";
  import { mediaStore } from "../stores";

  let files: FileList | null = null;

  $: files !== null && ($mediaStore.media = Array.from(files).map((file) => ({ src: URL.createObjectURL(file), isSelected: false })));

  const removeSelectedElements = () => {
    $mediaStore.media = $mediaStore.media.filter((media) => !media.isSelected);
  };
</script>

<div class="relative p-2 h-full overflow-scroll">
  <div class="flex justify-between">
    <input type="file" accept=".mp4,.webm,.mpeg,.mov,.avi" class="text-white h-8" multiple bind:files />
    <button
      class="text-white w-8 h-8 bg-neutral-700"
      class:opacity-50={!$mediaStore.isAnySelected}
      on:click={removeSelectedElements}
      disabled={!$mediaStore.isAnySelected}>🗑️</button
    >
  </div>
  <p class="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-500">media pool</p>
  {#if files}
    <div class="relative z-10">
      {#key $mediaStore.media.length}
        {#each $mediaStore.media as file, idx}
          <MediaPoolElement src={file.src} {idx} />
        {/each}
      {/key}
    </div>
  {/if}
</div>
