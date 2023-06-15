<script lang="ts">
  import { mediaPool } from "$lib/stores";

  export let mediaUUID: string;
  export let isTimelineElement: boolean = false;

  $: media = $mediaPool.media.find((media) => media.uuid === mediaUUID) as App.Image | App.Video;
</script>

<div class="relative w-full {isTimelineElement ? 'h-1/2' : 'h-full'} flex rounded-md overflow-clip">
  {#if media.type === "video"}
    <div class="h-full aspect-video bg-no-repeat bg-center bg-black bg-contain" style="background-image:url({media.metadata.thumbnails[0]});" />
  {:else}
    <div class="h-full aspect-video bg-no-repeat bg-center bg-contain bg-black" style="background-image:url({media.src});" />
  {/if}
</div>
