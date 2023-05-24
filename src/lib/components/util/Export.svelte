<script lang="ts">
  import { timeline } from "$lib/stores";
  import { ffmpegInstance } from "$lib/components/util/FFmpegManager";
  import { fetchFile } from "@ffmpeg/ffmpeg";

  let innerText = "";

  const getFileSystemNames = (uuid: string) => {
    const node = $timeline.clips.getByUUID(uuid);
    if (!node) throw new Error("node not found");

    return {
      base: node.metadata.uuid + ".mp4",
      trimmed: node.metadata.uuid + "_trimmed" + ".mp4",
    };
  };

  const exportTimeline = async () => {
    // ****************
    // 0. Setup
    // ****************
    if (!ffmpegInstance.isLoaded) throw new Error("ffmpeg.wasm did not load on editor startup. Please refresh the page.");
    const nodes = $timeline.clips.toArray();
    for (const node of nodes) {
      const { base, trimmed } = getFileSystemNames(node.uuid);

      ffmpegInstance.FS("writeFile", base, await fetchFile(node.metadata.src));
      ffmpegInstance.FS("writeFile", trimmed, "");
    }
    ffmpegInstance.FS("writeFile", "output.mp4", "");

    // ****************
    // 1. Trim offsets
    // ****************
    innerText = "trimming...";
    for (const { uuid, metadata } of nodes) {
      const { base, trimmed } = getFileSystemNames(uuid);

      await ffmpegInstance.run("-i", base, "-ss", metadata.startOffset.toString(), "-to", (metadata.duration - metadata.endOffset).toString(), trimmed);
    }

    // ****************
    // 2. Run concat filter (scaling & normalizing codecs)
    // ****************
    // see: https://stackoverflow.com/a/11175851/9473692
    //      https://superuser.com/a/972615
    //      https://ffmpeg.org/ffmpeg-filters.html#concat
    innerText = "concatenating...";

    const ftr = "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:-1:-1:color=black,setsar=1,fps=30,format=yuv420p";
    const filters = [
      `-filter_complex`,
      nodes.map((_, i) => `[${i}:v]${ftr}[v${i}];`).join("") + nodes.map((_, i) => `[v${i}][${i}:a]`).join("") + "concat=n=" + nodes.length + `:v=1:a=1[v][a]`,
    ];
    await ffmpegInstance.run(
      ...(nodes.map(({ uuid }) => ["-i", getFileSystemNames(uuid).trimmed]).flat() as string[]),
      ...filters,
      ...[`-map`, `[v]`, `-map`, `[a]`, `-c:v`, `libx264`, `-c:a`, `aac`, `-strict`, `experimental`, `-vsync`, `2`, `output.mp4`]
    );

    // ****************
    // 3. Export
    // ****************
    innerText = "export complete";
    const exportData = ffmpegInstance.FS("readFile", "output.mp4");

    const link = document.createElement("a");
    link.download = "output.mp4";
    link.href = URL.createObjectURL(new Blob([exportData.buffer], { type: "video/mp4" }));
    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent("click"));
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);
  };
</script>

<button on:click={exportTimeline} class="px-4 py-2 text-white border-[1px] border-neutral-600">export</button>
<p class="text-white my-4" bind:innerText contenteditable />
