<script lang="ts">
  import { secondWidth } from "$lib/stores";

  export let clip: App.Clip;
</script>

<div
  class="absolute h-12 bg-orange-200 rounded-lg"
  style="width: {clip.metadata.duration * $secondWidth}px; transform: translateX({clip.metadata.timelineStart * $secondWidth}px);"
/>
