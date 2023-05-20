<script lang="ts">
  import { timeline } from "$lib/stores";
  import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
  import { onMount } from "svelte";

  const ffmpeg = createFFmpeg({ log: true });

  let innerText = "";

  const getNames = (uuid: string) => {
    const node = $timeline.clips.getByUUID(uuid);

    if (!node) return;

    const baseName = node.metadata.name.split(".").splice(0, -1).join(".") + `-${node.uuid}`;
    return {
      base: baseName + "." + node.metadata.name.split(".").pop(),
      trimmed: baseName + "-trimmed" + "." + node.metadata.name.split(".").pop(),
      scaled: baseName + "-scaled" + "." + node.metadata.name.split(".").pop(),
    };
  };

  onMount(async () => {
    innerText = "Loading ffmpeg-core.js";
    await ffmpeg.load();
    innerText = "ready";
  });

  const exportTimeline = async () => {
    const nodes = $timeline.clips.toArray();

    // 1: trim offsets
    for (const node of nodes) {
      const names = getNames(node.uuid);
      if (!names) continue;

      const start = node.metadata.startOffset.toString();
      const end = node.metadata.endOffset.toString();
      await ffmpeg.run("-i", names.base, "-ss", start, "-to", end, names.trimmed);
    }
    innerText = "offsets trimmed, scaling...";

    // 2: scale each clip to 1920x1080
    for (const node of nodes) {
      const names = getNames(node.uuid);
      if (!names) continue;

      await ffmpeg.run("-i", names.trimmed, "-vf", "scale=1920:1080", names.scaled);
    }
    innerText = "scaling complete, concatenating...";

    // 3: concat scaled clips
    let files = [];
    for (const node of nodes) {
      const names = getNames(node.uuid);
      if (!names) continue;

      ffmpeg.FS("writeFile", names.base, await fetchFile(node.metadata.src));
      files.push(`file '${names.scaled}'`);
    }

    ffmpeg.FS("writeFile", "files.txt", files.join("\n"));
    await ffmpeg.run("-f", "concat", "-safe", "0", "-i", "files.txt", "-c", "copy", "output.mp4");
    innerText = "concat complete, exporting...";

    // 4: export
    const data = ffmpeg.FS("readFile", "output.mp4");
    const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
    innerText = "export complete";
    console.log(url);
  };
</script>

<button on:click={exportTimeline} class="px-4 py-2 text-white border-[1px] border-neutral-600">export</button>
<p class="text-white my-4" bind:innerText contenteditable />
