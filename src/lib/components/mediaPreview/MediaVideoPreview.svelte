<script lang="ts">
  import LoadIcon from "../util/LoadIcon.svelte";

  export let metadata: StudioMediaMetadata;
</script>

<div class="w-full h-full flex justify-center items-center rounded-md overflow-clip">
  {#await metadata.thumbnails}
    <LoadIcon />
  {:then thumbnails}
    {#each thumbnails as thumbnail}
      <div class="h-full aspect-video" style="background-image:url({thumbnail}); background-size: auto 100%;" />
    {/each}
  {/await}
</div>
