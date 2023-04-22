<script lang="ts">
  import MediaPoolElement from "./MediaPoolElement.svelte";
  import { mediaStore } from "../stores";

  $: isAnyMediaElementSelected = $mediaStore.media.some((media) => media.isSelected);

  let files: FileList;

  $: mediaStore.update((store) => {
    if (!files) return store;
    store.media = Array.from(files).map((file) => ({ src: URL.createObjectURL(file), isSelected: false }));
    return store;
  });

  const removeSelectedElements = () => {
    $mediaStore.media = $mediaStore.media.filter((media) => !media.isSelected);
  };
</script>

<div class="relative p-2 h-full overflow-scroll">
  <input type="file" accept=".mp4,.webm,.mpeg,.mov,.avi" class="text-white" multiple bind:files />
  {#if isAnyMediaElementSelected}
    <button on:click={removeSelectedElements}>trash selected</button>
  {/if}
  {#if files}
    <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-500">media pool</p>
    {#each $mediaStore.media as file, idx}
      <MediaPoolElement src={file.src} {idx} on:click={() => (file.isSelected = !file.isSelected)} />
    {/each}
    {#each $mediaStore.media as file}
      <p>{file.isSelected}</p>
    {/each}
  {/if}
</div>
