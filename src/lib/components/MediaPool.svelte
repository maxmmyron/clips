<script lang="ts">
  import { browser } from "$app/environment";
  import { mediaPool, timeline } from "$lib/stores";
  import { loadMediaMetadata } from "$lib/mediaLoader";
  import MediaVideoPreview from "./mediaPreview/MediaVideoPreview.svelte";
  import MediaPoolPreview from "./mediaPreview/MediaPoolPreview.svelte";
  import MediaAudioPreview from "./mediaPreview/MediaAudioPreview.svelte";

  $: browser && (window.mediaPool = $mediaPool.media);

  const handleDrop = (e: DragEvent) => {
    if (!e.dataTransfer) return;

    if (e.dataTransfer.items) updateMediaPool([...e.dataTransfer.items].filter((itm) => itm.kind === "file").map((itm) => itm.getAsFile() as File));
    else updateMediaPool([...e.dataTransfer.files]);
  };

  const handleUpload = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    if (!(e.target as HTMLInputElement).files) return;
    updateMediaPool([...((e.target as HTMLInputElement).files as FileList)]);
  };

  const updateMediaPool = (uploadedFiles: File[]) => {
    // filter out files that are already in media pool
    uploadedFiles.filter((file) => !$mediaPool.media.some((existingFile) => existingFile.metadata.title === file.name));

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

    // check if selected files are in timeline; show confirmation if so
    let selectedTimelineNodes = $timeline.timeline.toArray().filter(({ uuid }) => $mediaPool.selected.includes(uuid));
    if (selectedTimelineNodes.length > 0 && confirm(timelineConfirm) === false) return;

    // delete files from timeline and media pool, clear selection arr
    selectedTimelineNodes.forEach(({ uuid }) => $timeline.timeline.remove(uuid));
    $mediaPool.media = $mediaPool.media.filter(({ uuid }) => !$mediaPool.selected.includes(uuid));
    $mediaPool.selected = [];
  };

  let mows: number[] = [];

  const handleMow = () => {
    mows = [...mows, Date.now()];
    let id = setTimeout(() => mows.shift() && clearTimeout(id), 1000);
    console.log($timeline.timeline.head);
    console.log($timeline.timeline.tail);
    console.log($timeline.current);
    console.log($mediaPool.media);
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($mediaPool.selected = [])} />

<div class="relative pt-4 px-4 h-full overflow-y-scroll" on:dragover|preventDefault on:drop|preventDefault={handleDrop}>
  <div class="flex justify-between gap-2">
    <input type="file" accept="video/*,image/*,audio/*" class="text-white h-8" multiple on:change={handleUpload} />
  </div>
  <div class="w-full flex flex-wrap gap-3">
    {#key $mediaPool.media.length}
      {#each $mediaPool.media as media}
        <MediaPoolPreview {media}>
          {#if media.type === "video"}
            <MediaVideoPreview mediaUUID={media.uuid} />
          {:else if media.type === "image"}
            <div class="w-full h-full bg-neutral-400">
              <img src={media.src} alt={media.metadata.title} class="w-full h-full object-fit select-none" draggable="false" />
            </div>
          {:else if media.type === "audio"}
            <MediaAudioPreview mediaUUID={media.uuid} metadata={{ start: 0, end: 0 }} />
          {/if}
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
