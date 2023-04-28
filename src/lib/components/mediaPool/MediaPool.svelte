<script lang="ts">
  import { mediaPool, timeline } from "$lib/stores";
  import { loadAudioBufferSourceNode, loadMediaDuration, loadThumbnails } from "$lib/mediaLoader";
  import MediaPreviewProvider from "../MediaPreviewProvider.svelte";

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

  const loadMediaMetadata = (file: File) => {
    const src = URL.createObjectURL(file);

    return {
      src,
      name: file.name,
      duration: loadMediaDuration(src),
      thumbnails: loadThumbnails(src),
      audioBufferSourceNode: loadAudioBufferSourceNode(src),
    } as StudioMediaMetadata;
  };

  $: $mediaPool.media.concat(uploadedFiles.filter((file) => !$mediaPool.media.some((itm) => itm.name === file.name)).map((file) => loadMediaMetadata(file)));

  const handleKey = (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;

    // check if selected files are in timeline; show confirmation if so
    const isSelectedMediaInTimeline = $timeline.clips.some((clip) => $mediaPool.selected.includes(clip));
    const timelineConfirm = `Deleting these files will remove their references from the timeline. Are you sure?`;

    if (isSelectedMediaInTimeline && confirm(timelineConfirm) === false) return;

    // delete files from timeline and media pool, clear selection arr
    $timeline.clips = $timeline.clips.filter((clip) => !$mediaPool.selected.includes(clip));
    $mediaPool.media = $mediaPool.media.filter((file) => !$mediaPool.selected.includes(file));
    $mediaPool.selected = [];
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($mediaPool.selected = [])} />

<div class="pt-4 px-4 h-full overflow-scroll" on:dragover|preventDefault on:drop|preventDefault={handleDrop}>
  <div class="flex justify-between gap-2">
    <input type="file" accept=".mp4,.webm,.mpeg,.mov,.avi" class="text-white h-8" multiple on:change={handleUpload} />
  </div>
  <div class="w-full flex flex-wrap gap-3">
    {#key $mediaPool.media.length}
      {#each $mediaPool.media as metadata}
        <MediaPreviewProvider {metadata} store={mediaPool}>
          <MediaVideoPreview {metadata} />
        </MediaPreviewProvider>
      {/each}
    {/key}
  </div>
</div>
