<script lang="ts">
  import { mediaPool } from "$lib/stores";
  import { isImageMedia, isVideoMedia } from "../util/helpers";

  export let mediaUUID: string;
  export let isTimelineElement: boolean = false;

  const media = $mediaPool.media.find((media) => media.uuid === mediaUUID) as App.VideoMedia | App.ImageMedia;
</script>

<div class="relative w-full h-full flex rounded-md overflow-clip">
  {#if isVideoMedia(media)}
    {#each media.metadata.thumbnails as thumbnail}
      <div class="h-full aspect-video bg-no-repeat bg-center bg-black" style="background-image:url({thumbnail}); background-size: auto 100%;" />
    {/each}
  {:else}
    <div class="h-full aspect-video bg-no-repeat bg-center bg-black" style="background-image:url({media.src}); background-size: auto 100%;" />
  {/if}
</div>
