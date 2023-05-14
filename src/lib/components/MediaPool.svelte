<script lang="ts">
  import { browser } from "$app/environment";
  import { mediaPool, timeline } from "$lib/stores";
  import { loadMediaMetadata } from "$lib/mediaLoader";
  import MediaVideoPreview from "./mediaPreview/MediaVideoPreview.svelte";
  import MediaPoolPreview from "./mediaPreview/MediaPoolPreview.svelte";

  $: browser && (window.mediaPool = $mediaPool.media);

  const handleDrop = (e: DragEvent) => {
    if (!e.dataTransfer) return;

    if (e.dataTransfer.items) updateMediaPool([...e.dataTransfer.items].filter((itm) => itm.kind === "file").map((itm) => itm.getAsFile() as File));
    else updateMediaPool([...e.dataTransfer.files]);
  };

  const handleUpload = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    if (!(e.target as HTMLInputElement).files) return;
    updateMediaPool([...((e.target as HTMLInputElement).files as FileList)].filter((file) => file.type.startsWith("video/")));
  };

  const updateMediaPool = (uploadedFiles: File[]) => {
    // filter out files that are already in media pool
    uploadedFiles.filter((file) => !$mediaPool.media.some((existingFile) => existingFile.name === file.name));

    uploadedFiles.forEach((file) => {
      loadMediaMetadata(file).then((metadata) => {
        if (metadata === null) return;
        $mediaPool.media = [...$mediaPool.media, metadata];
      });
    });
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;

    const timelineConfirm = `Deleting these files will remove their references from the timeline. Are you sure?`;
    const selectedSources = $mediaPool.selected.map((file) => file.src);

    // check if selected files are in timeline; show confirmation if so
    let selectedTimelineNodes = $timeline.clips.toArray().filter((node) => selectedSources.includes(node.metadata.src));
    if (selectedTimelineNodes.length > 0 && confirm(timelineConfirm) === false) return;

    // delete files from timeline and media pool, clear selection arr
    selectedTimelineNodes.forEach((node) => $timeline.clips.remove(node.uuid));
    $mediaPool.media = $mediaPool.media.filter((file) => !$mediaPool.selected.includes(file));
    $mediaPool.selected = [];
  };

  let mows: number[] = [];

  const handleMow = () => {
    mows = [...mows, Date.now()];
    let id = setTimeout(() => mows.shift() && clearTimeout(id), 1000);
    console.log($timeline.clips.head);
    console.log($timeline.clips.tail);
    console.log($timeline.curr);
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($mediaPool.selected = [])} />

<div class="relative pt-4 px-4 h-full overflow-scroll" on:dragover|preventDefault on:drop|preventDefault={handleDrop}>
  <div class="flex justify-between gap-2">
    <input type="file" accept="video/*,image/*,audio/*" class="text-white h-8" multiple on:change={handleUpload} />
  </div>
  <div class="w-full flex flex-wrap gap-3">
    {#key $mediaPool.media.length}
      {#each $mediaPool.media as metadata}
        <MediaPoolPreview {metadata}>
          <MediaVideoPreview {metadata} />
        </MediaPoolPreview>
      {/each}
    {/key}
    <div class="absolute bottom-12 right-16">
      {#each mows as mow (mow)}
        <p class="absolute top-1/4 -left-4 text-neutral-400 animate-notification [animation-fill-mode:both]" style="font-family:'Comic Sans MS';">mow</p>
      {/each}
      <button class="cursor-grab active:cursor-grabbing" on:click={handleMow}>
        <pre class="group text-neutral-400 leading-tight font-serif">
        ╱|、
      (˚ˎ 。7
       |、˜〵
       じしˍ,)<span class="absolute origin-bottom-left group-hover:animate-wiggle">ノ</span>
    </pre>
      </button>
    </div>
  </div>
</div>
