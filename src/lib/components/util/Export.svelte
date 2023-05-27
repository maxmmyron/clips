<script lang="ts">
  import { timeline } from "$lib/stores";
  import { ffmpegInstance } from "./FFmpegManager";
  import { fetchFile } from "@ffmpeg/ffmpeg";

  let progressText = "";

  let baseExtensionMap = new Map([
    ["image", "png"],
    ["video", "mp4"],
    ["audio", "mp3"],
  ]);

  const exportTimeline = async () => {
    // ****************
    // 0. Setup
    // ****************
    if (!ffmpegInstance.isLoaded) throw new Error("ffmpeg.wasm did not load on editor startup. Please refresh the page.");
    const nodes = $timeline.timeline.toArray();
    for (const { uuid, src, type } of nodes) {
      ffmpegInstance.FS("writeFile", `${uuid}.${baseExtensionMap.get(type)}`, await fetchFile(src));
      ffmpegInstance.FS("writeFile", `${uuid}_trimmed.mp4`, "");
    }
    ffmpegInstance.FS("writeFile", "output.mp4", "");

    // ****************
    // 1. Trim offsets
    // ****************
    progressText = "trimming...";
    for (const { uuid, type, metadata } of nodes) {
      const [base, trimmed] = [`${uuid}.${baseExtensionMap.get(type)}`, `${uuid}_trimmed.mp4`];

      if (type === "image") {
        const dur = (metadata.duration - metadata.start - metadata.end).toString();
        const codec_pad = `-c:v libx264 -c:a aac -pix_fmt yuv420p -vf pad=ceil(iw/2)*2:ceil(ih/2)*2:0:0:black`.split(" ");
        await ffmpegInstance.run("-framerate", "30", "-i", base, "-f", "lavfi", "-i", "anullsrc", "-t", dur, ...codec_pad, "-movflags", "faststart", trimmed);
      } else if (type === "audio") {
        await ffmpegInstance.run("-f", "lavfi", "-i", "color=c=black:s=1280x720", "-i", base, "-shortest", "-fflags", "+shortest", trimmed);
      } else await ffmpegInstance.run("-i", base, "-ss", metadata.start.toString(), "-to", (metadata.duration - metadata.end).toString(), trimmed);
    }

    // ****************
    // 2. Run concat filter (scaling & normalizing codecs)
    // ****************
    // see: https://stackoverflow.com/a/11175851/9473692
    //      https://superuser.com/a/972615
    //      https://ffmpeg.org/ffmpeg-filters.html#concat
    progressText = "concatenating...";

    const ftr = "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:-1:-1:color=black,setsar=1,fps=30,format=yuv420p";
    const filters = [
      `-filter_complex`,
      nodes.map((_, i) => `[${i}:v]${ftr}[v${i}];`).join("") + nodes.map((_, i) => `[v${i}][${i}:a]`).join("") + "concat=n=" + nodes.length + `:v=1:a=1[v][a]`,
    ];
    await ffmpegInstance.run(
      ...nodes.map(({ uuid }) => ["-i", `${uuid}_trimmed.mp4`]).flat(),
      ...filters,
      ...[`-map`, `[v]`, `-map`, `[a]`, `-c:v`, `libx264`, `-c:a`, `aac`, `output.mp4`]
    );

    // ****************
    // 3. Export
    // ****************
    progressText = "export complete";
    const exportData = ffmpegInstance.FS("readFile", "output.mp4");

    const link = document.createElement("a");
    link.download = "output.mp4";
    link.href = URL.createObjectURL(new Blob([exportData.buffer], { type: "video/mp4" }));
    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent("click"));
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);
    progressText = "export complete";
  };
</script>

<button on:click={exportTimeline} class="px-4 py-2 text-white border-[1px] border-neutral-600">export</button>
<p class="text-white my-4">{progressText}</p>
<p class="text-white my-4">{progressText}</p>
