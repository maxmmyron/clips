<script lang="ts">
  import { browser } from "$app/environment";
  import { player, secondWidth, timeline, current, audioContext, media } from "$lib/stores";
  import { onMount } from "svelte";

  export let clip: App.Clip;
  export let selected: string[];

  $: browser && (window.current = $current);

  let buffer: HTMLVideoElement | HTMLImageElement;
  let audioNode: AudioBufferSourceNode;
  let hasAudioNodeStarted = false;

  let mediaPreview: HTMLButtonElement;
  let isMove = false,
    isResize = false;
  let initialResizePosition = 0,
    initialOffset = 0;
  let resizeDirection: "left" | "right" = "left";

  /**
   * Initial X position of mouse within clip at start of move
   */
  let initialX = 0;

  $: isSelected = selected.includes(clip.uuid);

  onMount(() => clip.type !== "audio" && (clip.buffer = buffer));

  // TODO:
  $: if (clip.type === "video" && $current.video.includes(clip.uuid)) {
    buffer = buffer as HTMLVideoElement;
    if (!$player.isPaused && buffer.paused) {
      buffer.currentTime = $timeline.runtime - clip.metadata.offset - clip.metadata.start;

      buffer.play();
    } else if ($player.isPaused && !buffer.paused) {
      buffer.pause();
    }
  } else if (buffer && clip.type === "video" && !$current.video.includes(clip.uuid)) {
    buffer = buffer as HTMLVideoElement;
    buffer.pause();
  }

  $: if (clip.type === "audio" && $current.audio.includes(clip.uuid)) {
    if (!$player.isPaused && !hasAudioNodeStarted) {
      audioNode = $audioContext.createBufferSource();
      audioNode.buffer = ($media.resolved.find((media) => media.uuid === clip.mediaUUID) as App.Audio | App.Video).metadata.audio;
      audioNode.connect($audioContext.destination);

      audioNode.start(0, $timeline.runtime - clip.metadata.offset - clip.metadata.start);
      hasAudioNodeStarted = true;
    } else if ($player.isPaused && hasAudioNodeStarted) {
      audioNode.stop();
      audioNode.disconnect();
      hasAudioNodeStarted = false;
    }
  } else if (clip.type === "audio" && !$current.audio.includes(clip.uuid)) {
    if (hasAudioNodeStarted) {
      audioNode.stop();
      audioNode.disconnect();
      hasAudioNodeStarted = false;
    }
  }

  const handleMove = (e: MouseEvent) => {
    if (isMove) {
      clip.metadata.offset = (e.clientX - initialX) / $secondWidth;

      if (clip.linkUUID) {
        if (clip.type === "audio") {
          (<App.Clip>$timeline.clips.video[clip.metadata.trackIdx].get(clip.linkUUID)).metadata.offset = clip.metadata.offset;
        }

        if (clip.type === "video") {
          (<App.Clip>$timeline.clips.audio[clip.metadata.trackIdx].get(clip.linkUUID)).metadata.offset = clip.metadata.offset;
        }

        $timeline.clips = $timeline.clips;
      }

      return;
    }

    if (isResize) {
      // let offset;
      if (resizeDirection == "left") clip.metadata.start = Math.max(0, initialOffset + (e.clientX - initialResizePosition) / $secondWidth);
      else clip.metadata.runtime = Math.min(initialOffset - (initialResizePosition - e.clientX) / $secondWidth, clip.metadata.duration);

      if (clip.linkUUID) {
        if (clip.type === "audio") {
          (<App.Clip>$timeline.clips.video[clip.metadata.trackIdx].get(clip.linkUUID)).metadata.start = clip.metadata.start;
          (<App.Clip>$timeline.clips.video[clip.metadata.trackIdx].get(clip.linkUUID)).metadata.runtime = clip.metadata.runtime;
        }
        if (clip.type === "video") {
          (<App.Clip>$timeline.clips.audio[clip.metadata.trackIdx].get(clip.linkUUID)).metadata.start = clip.metadata.start;
          (<App.Clip>$timeline.clips.audio[clip.metadata.trackIdx].get(clip.linkUUID)).metadata.runtime = clip.metadata.runtime;
        }

        $timeline.clips = $timeline.clips;
      }
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (e.shiftKey) selected = [...selected, clip.uuid];
    else {
      selected = [clip.uuid];
      let track = clip.type === "audio" ? $timeline.clips.audio[clip.metadata.trackIdx] : $timeline.clips.video[clip.metadata.trackIdx];
      clip.metadata.z = Math.max(...[...track.values()].map((clip) => clip.metadata.z)) + 1;
    }
  };

  const setupMove = (e: MouseEvent) => {
    initialOffset = clip.metadata.runtime;
    initialX = e.clientX;

    if (e.clientX - mediaPreview.getBoundingClientRect().x < 12) {
      isResize = true;
      initialResizePosition = mediaPreview.getBoundingClientRect().left;
      resizeDirection = "left";
      return;
    }

    if (mediaPreview.getBoundingClientRect().right - e.clientX < 12) {
      isResize = true;
      initialResizePosition = mediaPreview.getBoundingClientRect().right;
      resizeDirection = "right";
      return;
    }

    isMove = true;
    initialX = e.clientX - clip.metadata.offset * $secondWidth;
  };

  const endMove = () => {
    isMove = false;
    isResize = false;
  };
</script>

<svelte:window on:mousemove={handleMove} on:mouseup={endMove} />

<button
  class="absolute h-12 bg-neutral-800 rounded-lg {isSelected ? 'border-neutral-600' : 'border-neutral-700/50'} border-2 transition-colors
  before:absolute before:w-4 before:h-full before:-left-1 before:top-0 before:hover:cursor-ew-resize
  after:absolute after:w-4 after:h-full after:-right-1 after:top-0 after:hover:cursor-ew-resize"
  style="width: {(clip.metadata.runtime - clip.metadata.start) * $secondWidth}px; transform: translateX({(clip.metadata.offset + clip.metadata.start) *
    $secondWidth}px); z-index:{clip.metadata.z};"
  on:click|capture|stopPropagation={handleClick}
  on:mousedown={setupMove}
  bind:this={mediaPreview}
/>

{#if clip.type === "video"}
  <video muted class="pointer-events-none opacity-[0.000000001]" src={clip.src} bind:this={buffer} />
{:else if clip.type === "image"}
  <img class="pointer-events-none opacity-[0.000000001]" src={clip.src} bind:this={buffer} alt="" />
{/if}
