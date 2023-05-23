<script lang="ts">
  import { timeline } from "$lib/stores";
  import { ffmpegInstance } from "$lib/components/util/FFmpegManager";
  import { fetchFile } from "@ffmpeg/ffmpeg";

  let innerText = "",
    url = "";

  let downloadLink: HTMLAnchorElement;

  const getNames = (uuid: string) => {
    const node = $timeline.clips.getByUUID(uuid);
    if (!node) throw new Error("node not found");

    const baseName = `${node.uuid}`.replaceAll("-", "_");
    const pictureExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    let ext = pictureExts.includes(node.metadata.src.split(".").pop()!) ? node.metadata.name.split(".").pop() : "mp4";
    return {
      base: baseName + "." + ext,
      trimmed: baseName + "_trimmed" + "." + ext,
    };
  };

  const exportTimeline = async () => {
    // ****************
    // 0. Setup
    // ****************
    if (!ffmpegInstance.isLoaded) throw new Error("ffmpeg.wasm did not load on editor startup. Please refresh the page.");
    const nodes = $timeline.clips.toArray();
    for (const node of nodes) {
      const { base, trimmed } = getNames(node.uuid);

      ffmpegInstance.FS("writeFile", base, await fetchFile(node.metadata.src));
      ffmpegInstance.FS("writeFile", trimmed, "");
    }
    ffmpegInstance.FS("writeFile", "output.mp4", "");

    // ****************
    // 1. Trim offsets
    // ****************
    innerText = "trimming...";
    for (const { uuid, metadata } of nodes) {
      const { base, trimmed } = getNames(uuid);

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
      ...(nodes.map(({ uuid }) => ["-i", getNames(uuid).trimmed]).flat() as string[]),
      ...filters,
      ...[`-map`, `[v]`, `-map`, `[a]`, `-c:v`, `libx264`, `-c:a`, `aac`, `-strict`, `experimental`, `-vsync`, `2`, `output.mp4`]
    );

    // ****************
    // 3. Export
    // ****************
    innerText = "exporting...";
    const data = ffmpegInstance.FS("readFile", "output.mp4");
    url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
    innerText = "export complete";
    console.log(url);
  };
</script>

<button on:click={exportTimeline} class="px-4 py-2 text-white border-[1px] border-neutral-600">export</button>
<p class="text-white my-4" bind:innerText contenteditable />
<a download="output.mp4" href={url} class="text-white my-4 hidden" bind:this={downloadLink}>download</a>
