<script lang="ts">
  import { onMount } from "svelte";

  export let options: Omit<Media, "isSelected">;
  export let zoomScale: number;

  let audioContext: AudioContext = new AudioContext({ sampleRate: 44100 });
  let canvas: HTMLCanvasElement;

  onMount(() => {
    const videoEl = document.createElement("video");
    videoEl.src = options.src;
    videoEl.addEventListener("loadeddata", () => audioContext.createMediaElementSource(videoEl));

    const ctx = canvas.getContext("2d");
    if (!ctx) return console.error("Could not get canvas context");

    const audioBuffer = audioContext.createBuffer(1, options.duration * audioContext.sampleRate, audioContext.sampleRate);
    const audioData = audioBuffer.getChannelData(0);

    for (let i = 0; i < audioData.length; i++) {
      const percentage = i / audioData.length;
      audioData[i] = (Math.random() * 2 - 1) * percentage;
    }

    const width = canvas.width;
    const height = canvas.height;

    const step = Math.ceil(audioData.length / width);

    console.log(audioData);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";

    ctx.beginPath();

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j += 100) {
        const datum = audioData[i * step + j];

        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      ctx.moveTo(i, ((1 + min) * height) / 2);
      ctx.lineTo(i, ((1 + max) * height) / 2);
    }
    ctx.stroke();
    ctx.closePath();
  });
</script>

<button class="w-full h-24 rounded-md bg-indigo-200">
  <canvas class="w-full h-full" bind:this={canvas} />
</button>
