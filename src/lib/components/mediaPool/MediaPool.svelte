<script lang="ts">
  import MediaPoolElement from "./MediaPoolElement.svelte";
  import { media, timeline } from "$lib/stores";

  let uploadedFiles: File[] = [];

  const handleDrop = (e: DragEvent) => {
    if (!e.dataTransfer) return;

    if (e.dataTransfer.items)
      uploadedFiles = [...e.dataTransfer.items].filter((itm) => itm.kind === "file" && itm.type.startsWith("video/")).map((itm) => itm.getAsFile() as File);
    else uploadedFiles = [...e.dataTransfer.files].filter((file) => file.type.startsWith("video/"));
  };

  const handleUpload = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    if (!(e.target as HTMLInputElement).files) return;
    uploadedFiles = [...((e.target as HTMLInputElement).files as FileList)].filter((file) => file.type.startsWith("video/"));
  };

  const createMediaPoolFile = (file: File) => ({ src: URL.createObjectURL(file), isSelected: false, name: file.name });
  $: $media.files = [...$media.files, ...uploadedFiles.filter((file) => $media.files.every((f) => f.name !== file.name)).map((f) => createMediaPoolFile(f))];

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

<div class="pt-4 px-4 h-full overflow-scroll" on:dragover|preventDefault on:drop|preventDefault={handleDrop}>
  <div class="flex justify-between gap-2">
    <input type="file" accept=".mp4,.webm,.mpeg,.mov,.avi" class="text-white h-8" multiple on:change={handleUpload} />
  </div>
  <div class="w-full flex flex-wrap gap-3">
    {#key $media.files.length}
      {#each $media.files as file, idx}
        <MediaPoolElement src={file.src} {idx} />
      {/each}
    {/key}
  </div>
</div>
