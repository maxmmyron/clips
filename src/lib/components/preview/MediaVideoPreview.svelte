<script lang="ts">
  import { mediaPool } from "$lib/stores";

  export let mediaUUID: string;
  export let isTimelineElement: boolean = false;

  $: media = $mediaPool.media.find((media) => media.uuid === mediaUUID) as App.Image | App.Video;
</script>

<div class="relative w-full {isTimelineElement ? 'h-1/2' : 'h-full'} flex rounded-md overflow-clip">
  {#if media.type === "video"}
    {#each media.metadata.thumbnails as thumbnail}
      <div class="h-full aspect-video bg-no-repeat bg-center bg-black" style="background-image:url({thumbnail}); background-size: auto 100%;" />
    {/each}
  {:else}
    <div class="h-full aspect-video bg-no-repeat bg-center bg-black" style="background-image:url({media.src}); background-size: auto 100%;" />
  {/if}
</div>
