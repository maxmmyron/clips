<script lang="ts">
  export let options: Omit<Media, "isSelected">;
  export let zoomScale;

  let width = (options.duration - options.startOffset - options.endOffset) * zoomScale;
</script>

<div style="width: {width}px" class="h-24 rounded-md bg-indigo-700">
  <video src={options.src} class="w-full h-full">
    <track kind="captions" />
  </video>
</div>
