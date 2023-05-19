<script lang="ts">
  import { timeline } from "$lib/stores";
  import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
  import { onMount } from "svelte";

  const ffmpeg = createFFmpeg({ log: true });

  let innerText = "";

  onMount(async () => {
    innerText = "Loading ffmpeg-core.js";
    await ffmpeg.load();
    innerText = "ready";
  });

  const exportTimeline = async () => {
    const nodes = $timeline.clips.toArray();
    let files = [];
    innerText = "concatenating files";
    for (const node of nodes) {
      const name = node.metadata.name;
      ffmpeg.FS("writeFile", name, await fetchFile(node.metadata.src));
      files.push(`file '${name}'`);
    }

    // 1: remove start/end offsets from each clip
    innerText = "removing offsets complete, scaling...";

    // 2: scale each clip to 1920x1080
    innerText = "scaling complete, concatenating...";

    // 3: concat clips
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
