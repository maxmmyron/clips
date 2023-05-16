<script lang="ts">
  export let metadata: UploadedVideo;
  export let isTimelineElement: boolean = false;

  let containerWidth: number, nameWidth: number;

  $: shouldNameAnimate = nameWidth > containerWidth;
  $: nameOffset = containerWidth - nameWidth - 16;
</script>

<div class="relative w-full {isTimelineElement ? 'h-1/2' : 'h-full'} flex rounded-md overflow-clip">
  {#each metadata.thumbnails as thumbnail}
    <div class="h-full aspect-video bg-no-repeat bg-center bg-black" style="background-image:url({thumbnail}); background-size: auto 100%;" />
  {/each}
  <div class="absolute py-1 px-2 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm w-full bottom-0 overflow-clip" bind:clientWidth={containerWidth}>
    <p style="--overflow-scroll-pos: {nameOffset}px" class="relative text-white m-0 w-max {shouldNameAnimate && 'animate'}" bind:clientWidth={nameWidth}>
      {metadata.name}
    </p>
  </div>
</div>

<style>
  .animate {
    animation: name-scroll 7.5s linear infinite alternate;
  }

  @keyframes name-scroll {
    0% {
      left: 0px;
    }
    25% {
      left: 0px;
    }
    75% {
      left: var(--overflow-scroll-pos);
    }
    100% {
      left: var(--overflow-scroll-pos);
    }
  }
</style>
