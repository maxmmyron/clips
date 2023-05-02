<script lang="ts">
  import { player } from "$lib/stores";

  let video: HTMLVideoElement | null = null;
  let currentTime = 0;

  $: $player.isPlaying, video && ($player.isPlaying ? video.play() : video.pause());

  $: $player.currentTime = currentTime;
</script>

<video class="w-full h-full" bind:this={video} src={$player.sourceMetadata?.src} bind:currentTime>
  <track kind="captions" />
</video>
