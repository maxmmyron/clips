<script lang="ts">
  import { mediaPool } from "$lib/stores";

  export let mediaUUID: string;
  export let isTimelineElement: boolean = false;

  const media = $mediaPool.media.find((media) => media.uuid === mediaUUID) as App.VideoMedia;
</script>

<div class="relative w-full {isTimelineElement ? 'h-1/2' : 'h-full'} flex rounded-md overflow-clip">
  {#each media.metadata.thumbnails as thumbnail}
    <div class="h-full aspect-video bg-no-repeat bg-center bg-black" style="background-image:url({thumbnail}); background-size: auto 100%;" />
  {/each}
</div>
