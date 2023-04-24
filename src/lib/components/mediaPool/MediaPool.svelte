<script lang="ts">
  import MediaPoolElement from "./MediaPoolElement.svelte";
  import { media, timeline } from "$lib/stores";

  let files: FileList | null = null;

  $: files !== null && ($media.files = Array.from(files).map((file) => ({ src: URL.createObjectURL(file), isSelected: false })));

  const handleKey = (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;

    const timelinesContainsFiles = $timeline.clips.some((clip) => $media.selected.includes($media.files.findIndex((file) => file.src === clip.src)));
    const timelineConfirm = `Deleting these files will remove their references from the timeline. Are you sure?`;

    if (timelinesContainsFiles && confirm(timelineConfirm) === false) return;

    $timeline.clips = $timeline.clips.filter((clip) => !$media.selected.includes($media.files.findIndex((file) => file.src === clip.src)));
    $media.files = $media.files.filter((_, idx) => !$media.selected.includes(idx));
    $media.selected = [];
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($media.selected = [])} />

<div class="relative pt-4 px-4 h-full overflow-scroll">
  <div class="flex justify-between gap-2">
    <input type="file" accept=".mp4,.webm,.mpeg,.mov,.avi" class="text-white h-8" multiple bind:files />
  </div>
  <p class="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-500">media pool</p>
  {#if files}
    <div class="w-full flex flex-wrap gap-3">
      {#key $media.files.length}
        {#each $media.files as file, idx}
          <MediaPoolElement src={file.src} {idx} />
        {/each}
      {/key}
    </div>
  {/if}
</div>
