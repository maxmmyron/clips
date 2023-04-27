<script lang="ts">
  export let options: Omit<Media, "isSelected">;
  export let zoomScale: number;

  let audioContext = new AudioContext();

  fetch(options.src).then((res) => res.arrayBuffer().then((buffer) => audioContext.decodeAudioData(buffer, onDecode)));

  const onDecode = (buffer: AudioBuffer) => {
    // create buffer from loaded buffer
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    // copy buffer data to float32Array
    const dataArray = new Float32Array(source.buffer.length);
    source.buffer.copyFromChannel(dataArray, 0);

    // # steps per pixel on screen
    const step = Math.ceil(dataArray.length / canvas.width);

    const ctx = canvas.getContext("2d");
    if (!ctx) return console.error("Could not get canvas context");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";

    ctx.beginPath();

    // if empty, just draw a line
    if (dataArray.every((datum) => datum === 0)) {
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      return;
    }

    for (let i = 0; i < canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;

      // loop over step-sized chunks of data, find min and max, and draw to screen for that "pixel column"
      for (let j = 0; j < step; j++) {
        const datum = dataArray[i * step + j];

        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      ctx.moveTo(i, ((1 + min) * canvas.height) / 2);
      ctx.lineTo(i, ((1 + max) * canvas.height) / 2);
    }
    ctx.stroke();
  };

  let canvas: HTMLCanvasElement;
</script>

<div class="w-full h-24 rounded-md bg-indigo-200">
  <canvas class="w-full h-full" bind:this={canvas} />
</div>
