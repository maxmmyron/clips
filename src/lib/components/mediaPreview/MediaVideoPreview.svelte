<script lang="ts">
  import LoadIcon from "../util/LoadIcon.svelte";

  export let metadata: StudioMediaMetadata;
  export let isTimelineElement: boolean = false;
</script>

{#await metadata.thumbnails}
  <div class="w-full h-full flex justify-center items-center rounded-md overflow-clip">
    <LoadIcon />
  </div>
{:then thumbnails}
  <div class="w-full {isTimelineElement ? 'h-1/2' : 'h-full'} flex rounded-md overflow-clip">
    {#each thumbnails as thumbnail}
      <div class="h-full aspect-video" style="background-image:url({thumbnail}); background-size: auto 100%;" />
    {/each}
  </div>
{/await}
