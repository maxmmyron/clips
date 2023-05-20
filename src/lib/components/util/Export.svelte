<script lang="ts">
  import { timeline } from "$lib/stores";
  import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
  import { onMount } from "svelte";

  const ffmpeg = createFFmpeg({ log: true });

  let innerText = "";

  const getNames = (uuid: string) => {
    const node = $timeline.clips.getByUUID(uuid);

    if (!node) return;

    const baseName = node.metadata.name.split(".").slice(0, -1).join(".") + `-${node.uuid}`.replaceAll("-", "_");
    return {
      base: baseName + "." + node.metadata.name.split(".").pop(),
      trimmed: baseName + "_trimmed" + "." + node.metadata.name.split(".").pop(),
      scaled: baseName + "_scaled" + "." + node.metadata.name.split(".").pop(),
      normalized: baseName + "_normalized" + "." + node.metadata.name.split(".").pop(),
    };
  };

  onMount(async () => {
    innerText = "Loading ffmpeg-core.js";
    await ffmpeg.load();
    innerText = "ready";
  });

  const exportTimeline = async () => {
    const nodes = $timeline.clips.toArray();
    for (const node of nodes) {
      const names = getNames(node.uuid);
      if (!names) continue;

      ffmpeg.FS("writeFile", names.base, await fetchFile(node.metadata.src));
    }

    // 1: trim offsets
    innerText = "trimming...";
    for (const node of nodes) {
      const names = getNames(node.uuid);
      if (!names) continue;

      const start = node.metadata.startOffset.toString();
      const end = (node.metadata.duration - node.metadata.endOffset).toString();
      ffmpeg.FS("writeFile", names.trimmed, "");
      await ffmpeg.run("-i", names.base, "-ss", start, "-to", end, names.trimmed);
      // re
    }

    // 2: scale each clip to 1920x1080
    innerText = "scaling...";
    for (const node of nodes) {
      const names = getNames(node.uuid);
      if (!names) continue;

      ffmpeg.FS("writeFile", names.scaled, "");
      // TODO: fix this scaling command to work with videos of non-similar aspect ratios
      //await ffmpeg.run("-i", names.trimmed, "-vf", "scale=1920:1080", names.scaled);
      await ffmpeg.run("-i", names.trimmed, "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1:color=black", names.scaled);
    }

    // 3: clean clips: fix timestamps, normalize codecs, etc.
    innerText = "normalizing...";
    for (const node of nodes) {
      const names = getNames(node.uuid);
      if (!names) continue;

      ffmpeg.FS("writeFile", names.scaled, "");
      await ffmpeg.run("-i", names.scaled, "-r", "60", names.scaled);
    }

    // 4: concat scaled clips
    innerText = "concatenating...";
    let files = [];
    for (const node of nodes) {
      const names = getNames(node.uuid);
      if (!names) continue;

      files.push(`file '${names.scaled}'`);
    }

    ffmpeg.FS("writeFile", "files.txt", files.join("\n"));
    await ffmpeg.run("-f", "concat", "-safe", "0", "-i", "files.txt", "-c", "copy", "output.mp4");

    // 5: export
    innerText = "exporting...";
    const data = ffmpeg.FS("readFile", "output.mp4");
    const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
    innerText = "export complete";
    console.log(url);
  };
</script>

<button on:click={exportTimeline} class="px-4 py-2 text-white border-[1px] border-neutral-600">export</button>
<p class="text-white my-4" bind:innerText contenteditable />
