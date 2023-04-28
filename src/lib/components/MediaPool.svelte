<script lang="ts">
  import { mediaPool, timeline } from "$lib/stores";
  import { loadMediaMetadata } from "$lib/mediaLoader";
  import MediaPreviewProvider from "./mediaPreview/MediaPreviewProvider.svelte";
  import MediaVideoPreview from "./mediaPreview/MediaVideoPreview.svelte";

  const handleDrop = (e: DragEvent) => {
    if (!e.dataTransfer) return;

    if (e.dataTransfer.items)
      updateMediaPool([...e.dataTransfer.items].filter((itm) => itm.kind === "file" && itm.type.startsWith("video/")).map((itm) => itm.getAsFile() as File));
    else updateMediaPool([...e.dataTransfer.files].filter((file) => file.type.startsWith("video/")));
  };

  const handleUpload = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    if (!(e.target as HTMLInputElement).files) return;
    updateMediaPool([...((e.target as HTMLInputElement).files as FileList)].filter((file) => file.type.startsWith("video/")));
  };

  const updateMediaPool = (uploadedFiles: File[]) => {
    const media = uploadedFiles
      .map((file) => loadMediaMetadata(file))
      .filter((file) => !$mediaPool.media.some((existingFile) => existingFile.name === file.name));

    $mediaPool.media = [...$mediaPool.media, ...media];
  };

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
    {console.log("creating new:" + $mediaPool.media)}
    {#key $mediaPool.media.length}
      {#each $mediaPool.media as metadata}
        <MediaPreviewProvider {metadata} store={mediaPool}>
          <MediaVideoPreview {metadata} />
        </MediaPreviewProvider>
      {/each}
    {/key}
  </div>
</div>
