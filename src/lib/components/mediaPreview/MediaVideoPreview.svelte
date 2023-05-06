<script lang="ts">
  export let metadata: {
    name: string;
    thumbnails: string[];
  };
  export let isTimelineElement: boolean = false;
</script>

<div class="w-full {isTimelineElement ? 'h-1/2' : 'h-full'} flex rounded-md overflow-clip">
  {#each metadata.thumbnails as thumbnail}
    <div class="h-full aspect-video bg-no-repeat bg-center bg-black" style="background-image:url({thumbnail}); background-size: auto 100%;" />
  {/each}
  <!-- TODO: display media name -->
</div>
