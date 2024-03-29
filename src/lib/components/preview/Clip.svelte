<script lang="ts">
  import { browser } from "$app/environment";
  import { player, secondWidth, timeline, current, audioContext, media } from "$lib/stores";
  import { onMount } from "svelte";
  import MediaAudioPreview from "./MediaAudioPreview.svelte";
  import MediaVideoPreview from "./MediaVideoPreview.svelte";
  import Marquee from "../util/Marquee.svelte";

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
    initialRuntime = 0;
  let resizeDirection: "left" | "right" = "left";

  /**
   * Initial X position of mouse within clip at start of move
   */
  let initialX = 0;

  $: isSelected = selected.includes(clip.uuid);

  onMount(() => clip.type !== "audio" && (clip.buffer = buffer));

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
      // update timeline offset based on mouse position and clamp above 0
      clip.metadata.offset = Math.max(0, (e.clientX - initialX) / $secondWidth);

      // get linked clip and update relevant properties
      if (!clip.linkUUID) return;
      const linkedClip = <App.Clip>$timeline.clips[clip.type === "audio" ? "video" : "audio"][clip.metadata.trackIdx].get(clip.linkUUID);
      linkedClip.metadata.offset = clip.metadata.offset;
      $timeline.clips = $timeline.clips;

      return;
    }

    if (isResize) {
      // clamp start time of clip between 0 (0 offset) and the current runtime of the clip - 1 frame (1/60 seconds)
      if (resizeDirection == "left") clip.metadata.start = Math.min(clip.metadata.runtime - 1 / 60, Math.max(0, (e.clientX - initialX) / $secondWidth));
      // otherwise, clamp total runtime between the current start offset and the total duration of the clip
      else clip.metadata.runtime = Math.min(initialRuntime - (initialResizePosition - e.clientX) / $secondWidth, clip.metadata.duration - clip.metadata.start);

      // get linked clip and update relevant properties
      if (!clip.linkUUID) return;
      const linkedClip = <App.Clip>$timeline.clips[clip.type === "audio" ? "video" : "audio"][clip.metadata.trackIdx].get(clip.linkUUID);
      linkedClip.metadata.start = clip.metadata.start;
      linkedClip.metadata.runtime = clip.metadata.runtime;
      $timeline.clips = $timeline.clips;
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (e.shiftKey) selected = [...selected, clip.uuid];
    else {
      selected = [clip.uuid];
      let track = clip.type === "audio" ? $timeline.clips.audio[clip.metadata.trackIdx] : $timeline.clips.video[clip.metadata.trackIdx];
      clip.metadata.z = Math.max(...[...track.values()].map((clip) => clip.metadata.z)) + 1;

      // get linked Clip and its corresponding track, and update z based on track
      if (!clip.linkUUID) return;
      track = clip.type === "audio" ? $timeline.clips.video[clip.metadata.trackIdx] : $timeline.clips.audio[clip.metadata.trackIdx];
      const linkedClip = <App.Clip>$timeline.clips[clip.type === "audio" ? "video" : "audio"][clip.metadata.trackIdx].get(clip.linkUUID);
      linkedClip.metadata.z = Math.max(...[...track.values()].map((clip) => clip.metadata.z)) + 1;
      $timeline.clips = $timeline.clips;
    }
  };

  const setupMove = (e: MouseEvent) => {
    initialRuntime = clip.metadata.runtime;
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
  class="absolute top-0 h-16 bg-neutral-800 rounded-lg border-neutral-700/50 border-2 transition-shadow ring-blue-700 {isSelected
    ? 'ring-2'
    : 'ring-0'} overflow-hidden
  before:absolute before:w-4 before:h-full before:-left-1 before:top-0 before:hover:cursor-ew-resize before:z-10
  after:absolute after:w-4 after:h-full after:-right-1 after:top-0 after:hover:cursor-ew-resize"
  style="width: {(clip.metadata.runtime - clip.metadata.start) * $secondWidth}px; transform: translateX({(clip.metadata.offset + clip.metadata.start) *
    $secondWidth}px); z-index:{clip.metadata.z};"
  on:click|capture|stopPropagation={handleClick}
  on:mousedown={setupMove}
  bind:this={mediaPreview}
>
  {#if clip.type === "audio"}
    {#key $timeline.zoomScale || clip.metadata.runtime}
      <MediaAudioPreview mediaUUID={clip.mediaUUID} start={clip.metadata.start} runtime={clip.metadata.runtime} />
    {/key}
  {:else}
    <MediaVideoPreview mediaUUID={clip.mediaUUID} isTimelineElement />
  {/if}
  <div class="absolute bottom-0 left-0 w-full py-0.5 px-1 bg-neutral-800/75 backdrop-blur-lg">
    <Marquee class="text-xs">{clip.metadata.title}</Marquee>
  </div>
</button>

{#if clip.type === "video"}
  <video muted class="pointer-events-none opacity-[0.000000001]" src={clip.src} bind:this={buffer} />
{:else if clip.type === "image"}
  <img class="pointer-events-none opacity-[0.000000001]" src={clip.src} bind:this={buffer} alt="" />
{/if}
