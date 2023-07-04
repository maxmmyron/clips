<script lang="ts">
  import { media } from "$lib/stores";

  export let mediaUUID: string;
  export let isTimelineElement: boolean = false;

  let resolved = $media.resolved.find((m) => m.uuid === mediaUUID) as App.Media;
</script>

<div class="relative w-full {isTimelineElement ? 'h-1/2' : 'h-full'} flex rounded-md overflow-clip">
  {#if resolved.type === "video"}
    <div class="h-full aspect-video bg-no-repeat bg-center bg-black bg-contain" style="background-image:url({resolved.metadata.thumbnails[0]});" />
  {:else}
    <div class="h-full aspect-video bg-no-repeat bg-center bg-contain bg-black" style="background-image:url({resolved.src});" />
  {/if}
</div>
