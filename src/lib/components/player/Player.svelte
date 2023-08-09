<script lang="ts">
  import { timeline, current } from "$lib/stores";
  import { Canvas, Layer, t, type Render } from "svelte-canvas";

  export let width: number, height: number;

  const calcDimensions = (
    type: "video" | "image",
    buffer: HTMLVideoElement | HTMLImageElement
  ) => {
    let sourceDim: [number, number] = [-1, -1];

    if (type === "video")
      sourceDim = [
        (buffer as HTMLVideoElement).videoWidth,
        (buffer as HTMLVideoElement).videoHeight,
      ];
    else if (type === "image")
      sourceDim = [
        (buffer as HTMLImageElement).naturalWidth,
        (buffer as HTMLImageElement).naturalHeight,
      ];

    const mediaDim: [number, number] = [
      sourceDim[0] * Math.min(width / sourceDim[0], height / sourceDim[1]),
      sourceDim[1] * Math.min(width / sourceDim[0], height / sourceDim[1]),
    ];

    const mediaPos: [number, number] = [
      Math.max(0, (width - mediaDim[0]) / 2),
      Math.max(0, (height - mediaDim[1]) / 2),
    ];

    return { sourceDim, mediaDim, mediaPos };
  };

  let render: Render;
  $: render = ({ context, width, height }) => {
    let totalPerf = performance.now();
    if (!$current.video || $current.video.length === 0) {
      context.fillStyle = "black";
      context.fillRect(0, 0, width, height);
      return;
    }

    for (let i = 0; i < $current.video.length; i++) {
      let currentUUID = $current.video[i];
      if (!currentUUID) continue;
      const clip = $timeline.clips.video[i].get(currentUUID);
      if (!clip || !clip.buffer) continue;

      let perf = performance.now();
      const { sourceDim, mediaDim, mediaPos } = calcDimensions(
        clip.type,
        clip.buffer
      );
      console.log(`calc: ${performance.now() - perf}`);

      perf = performance.now();
      context.drawImage(
        clip.buffer,
        0,
        0,
        ...sourceDim,
        ...mediaPos,
        ...mediaDim
      );
      console.log(`draw: ${performance.now() - perf}`);
    }
    console.log(`total: ${performance.now() - totalPerf}`);
  };
</script>

<Canvas {width} {height}>
  <Layer {render} />
</Canvas>
