<script lang="ts">
  import { media } from "$lib/stores";

  export let mediaUUID: string;
  export let isTimelineElement: boolean = false;

  let resolved = $media.resolved.find((m) => m.uuid === mediaUUID) as App.Media;

  $: url = resolved.type === "video" ? resolved.metadata.thumbnails[0] : resolved.src;
</script>

<div class="relative w-full h-full flex rounded-md overflow-clip">
  {#if isTimelineElement}
    <div class="h-full w-full bg-contain brightness-90 bg-repeat-x" style="background-image:url({url});" />
  {:else}
    <div class="h-full aspect-video bg-no-repeat bg-center bg-black bg-contain" style="background-image:url({url});" />
  {/if}
</div>
