<script lang="ts">
  import { browser } from "$app/environment";
  import { media, timeline, buffers } from "$lib/stores";
  import { createMedia } from "./mediaLoader";
  import { addToast } from "$lib/util/toastManager";
  import MediaPoolPreview from "../preview/MediaPoolPreview.svelte";
  import Button from "../util/Button.svelte";

  export let selected: string[] = [];

  $: browser &&
    (window.media = {
      unresolved: $media.unresolved,
      resolved: $media.resolved,
    });

  const handleDrop = (e: DragEvent) => {
    if (!e.dataTransfer) return;

    if (e.dataTransfer.items) addFiles([...e.dataTransfer.items].filter((itm) => itm.kind === "file").map((itm) => itm.getAsFile() as File));
    else addFiles([...e.dataTransfer.files]);
  };

  const handleUpload = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    if (!(e.target as HTMLInputElement).files) return;

    addFiles([...((e.target as HTMLInputElement).files as FileList)]);
  };

  const addFiles = async (uploadedFiles: File[]) => {
    // filter out files that are already in media pool
    // TODO: implement a more robust duplicate check using file metadata as opposed to lazy name check
    uploadedFiles = uploadedFiles.filter((file) => !$media.resolved.some((resolvedMedia) => resolvedMedia.metadata.title === file.name));

    // TODO: rewrite currently doesn't have current conversion status support
    for (const file of uploadedFiles) {
      const type = file.type.includes("video") ? "video" : file.type.includes("audio") ? "audio" : "image";
      let unresolved = await createMedia(type, file.name, file);

      $media.unresolved = [...$media.unresolved, unresolved];
      unresolved.media.then((media) => ($media.resolved = [...$media.resolved, media])).catch((e) => addToast("error", `Failed to load ${file.name}: ${e}`));
    }
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;

    const timelineConfirm = `Deleting these files will remove their references from the timeline. Do you want to continue?`;

    // check if selected files are in timeline; show confirmation if so
    let selectedTimelineNodes = $timeline.clips.toArray().filter(({ mediaUUID }) => $media.resolved.some((resolvedMedia) => resolvedMedia.uuid === mediaUUID));
    if (selectedTimelineNodes.length > 0 && confirm(timelineConfirm) === false) return;

    // delete files from timeline and media pool, clear selection arr
    selectedTimelineNodes.forEach(({ uuid }) => $timeline.clips.remove(uuid));
    $media.unresolved = $media.unresolved.filter(({ uuid }) => !selected.includes(uuid));
    $media.resolved = $media.resolved.filter(({ uuid }) => !selected.includes(uuid));

    selected = [];
  };

  let mows: number[] = [];

  const handleMow = () => {
    mows = [...mows, Date.now()];
    let id = setTimeout(() => mows.shift() && clearTimeout(id), 1000);

    console.log("-----------------------");
    console.log("MEDIA POOL DATA");
    console.log("-----------------------");
    console.log($media.unresolved);
    console.log($media.resolved);

    console.log("-----------------------");
    console.log("TIMELINE DATA");
    console.log("-----------------------");
    console.log($timeline.clips.head);
    console.log($timeline.clips.tail);
    console.log($timeline.current);

    console.log("-----------------------");
    console.log("BUFFER DATA");
    console.log("-----------------------");
    console.log($buffers);
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => (selected = [])} />

<div class="relative h-full overflow-y-scroll" on:dragover|preventDefault on:drop|preventDefault={handleDrop}>
  <div class="flex justify-between items-center gap-2 mb-4">
    <p class="font-mono font-bold text-neutral-500">MEDIA POOL</p>
    <label class="group/label">
      <input
        type="file"
        accept="video/*,image/*,audio/*,.avif"
        class="w-[1px] h-[1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap border-none absolute"
        multiple
        on:change={handleUpload}
      />
      <Button key="u" useAlt isFake>upload</Button>
    </label>
  </div>
  <div class="w-full flex flex-wrap gap-3">
    {#each $media.unresolved as { uuid, name, media }}
      <MediaPoolPreview {uuid} {name} unresolved={media} bind:selected />
    {/each}
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
