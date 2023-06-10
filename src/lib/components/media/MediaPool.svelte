<script lang="ts">
  import { browser } from "$app/environment";
  import { mediaPool, timeline } from "$lib/stores";
  import { createMedia } from "./mediaLoader";
  import MediaVideoPreview from "../preview/MediaVideoPreview.svelte";
  import MediaPoolPreview from "../preview/MediaPoolPreview.svelte";
  import MediaAudioPreview from "../preview/MediaAudioPreview.svelte";
  import { parseMIME } from "$lib/components/media/mimeParser";
  import { assertBrowserSupportsContainer } from "$lib/components/media/browserParser";
  import { convertFileToSupportedContainer } from "$lib/util/FFmpegManager";

  let unresolvedMedia: { name: string; msg: string }[] = [];

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

  const updateMediaPool = async (uploadedFiles: File[]) => {
    // filter out files that are already in media pool
    // TODO: implement a more robust duplicate check using file metadata as opposed to lazy name check
    uploadedFiles = uploadedFiles.filter((file) => !$mediaPool.media.some((existingFile) => existingFile.metadata.title === file.name));
    uploadedFiles.forEach((file) => (unresolvedMedia.push({ name: file.name, msg: "parsing MIME type..." }), console.log(unresolvedMedia)));

    for (const file of uploadedFiles) {
      const idx = unresolvedMedia.findIndex((media) => media.name === file.name);
      if (idx === -1) continue;
      const MIME = await parseMIME(file);
      if (MIME === "file/unknown") {
        unresolvedMedia.splice(idx, 1);
        return;
      }

      unresolvedMedia[idx].msg = "checking media support...";
      const browserSupportsContainer = await assertBrowserSupportsContainer(MIME);

      let src: string;
      if (!browserSupportsContainer) {
        unresolvedMedia[idx].msg = "converting...";

        src = await convertFileToSupportedContainer(file, MIME);
      } else src = URL.createObjectURL(file);

      unresolvedMedia[idx].msg = "loading metadata...";

      let media: App.Media | null = null;
      if (file.type.includes("video")) media = await createMedia("video", file.name, src);
      else if (file.type.includes("audio")) media = await createMedia("audio", file.name, src);
      else media = await createMedia("image", file.name, src);

      if (media === null) {
        unresolvedMedia.splice(idx, 1);
        return;
      }

      unresolvedMedia.splice(idx, 1);
      $mediaPool.media = [...$mediaPool.media, media];
    }

    unresolvedMedia = [];
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
    console.log("-----------------------");
    console.log("MEDIA POOL DATA");
    console.log("-----------------------");
    console.log($mediaPool.media);

    console.log("-----------------------");
    console.log("TIMELINE DATA");
    console.log("-----------------------");
    console.log($timeline.timeline.head);
    console.log($timeline.timeline.tail);
    console.log($timeline.current);
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($mediaPool.selected = [])} />

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
      <div
        class="group/button p-2 border-[1px] border-indigo-900 rounded-md shadow-md transition-all cursor-pointer
        bg-gradient-to-b from-slate-800 to-slate-900
        hover:border-indigo-950 hover:from-slate-900 hover:to-slate-800 hover:shadow-sm
        group-focus-within/label:border-indigo-950 group-focus-within/label:from-slate-900 group-focus-within/label:to-slate-800 group-focus-within/label:shadow-sm"
      >
        <img
          src="/icons/upload_dark.svg"
          alt="Upload media"
          class="transition-all w-6 h-6 p-1
        group-hover/button:brightness-200 group-hover/button:scale-110
        group-focus-within/label:brightness-200 group-focus-within/label:scale-110"
        />
      </div>
    </label>
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
    {#each unresolvedMedia as media, i}
      <MediaPoolPreview hasResolved={false} name={media.name} currentLoadState={unresolvedMedia[i].msg} />
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
