<script lang="ts">
  import { current, draggable, player, secondWidth, timeline } from "$lib/stores";
  import { v4 as uuidv4 } from "uuid";
  import TimelinePreview from "../preview/TimelinePreview.svelte";
  import MediaAudioPreview from "../preview/MediaAudioPreview.svelte";
  import MediaVideoPreview from "../preview/MediaVideoPreview.svelte";
  import Clip from "../preview/Clip.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  export let scrollX: number = 0;

  let startTrackIdx = -1,
    currTrackIdx = -1;
  let startTrackType: "video" | "audio" = "video",
    currTrackType: "video" | "audio" = "video";

  /**
   * uuids of selected timeline clips
   */
  let selected: string[] = [];

  let z = 0;

  const getCurrentTrackClip = <T extends (App.VideoClip | App.ImageClip) | App.AudioClip>(track: Map<string, T>) => {
    let validClips: T[] = [];
    for (const [uuid, clip] of [...track]) {
      if (clip.metadata.offset < $timeline.runtime && clip.metadata.offset + clip.metadata.duration > $timeline.runtime) validClips.push(clip);
      if (clip.metadata.offset > $timeline.runtime) break;
    }
    if (validClips.length === 0) return null;
    return validClips.sort((a, b) => b.metadata.z - a.metadata.z)[0];
  };

  let lastTimestamp = 0;
  const calcTimeline = (timestamp: number) => {
    for (let i = 0; i < $timeline.clips.video.length; i++) {
      const curr = getCurrentTrackClip($timeline.clips.video[i]);
      if (curr) {
        if ($current.video[i] !== curr.uuid) $current.video[i] = curr.uuid;
      } else $current.video[i] = null;
    }

    for (let i = 0; i < $timeline.clips.audio.length; i++) {
      const curr = getCurrentTrackClip($timeline.clips.audio[i]);
      if (curr) {
        if ($current.audio[i] !== curr.uuid) $current.audio[i] = curr.uuid;
      } else $current.audio[i] = null;
    }

    if ($player.isPaused) {
      lastTimestamp = timestamp;
      requestAnimationFrame(calcTimeline);
      return;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    $timeline.runtime += delta / 1000;

    requestAnimationFrame(calcTimeline);
  };

  onMount(() => requestAnimationFrame(calcTimeline));

  $: browser && (window.timeline = $timeline.clips);

  /**
   * Sets up the drag event for the current track
   */
  const setupDrag = (e: MouseEvent, trackIdx: number, trackType: "video" | "audio") => {
    if (e.button !== 0) return;
    startTrackIdx = currTrackIdx = trackIdx;
    startTrackType = currTrackType = trackType;
    $draggable.event = "start";
    $draggable.origin = { pos: { x: e.clientX, y: e.clientY }, region: "timeline" };
  };

  // TODO: implement moving a clip across a track boundary
  /**
   * Handles the continued element drag around the timeline.
   * this is bound to the general timeline container so the mouse can move outside a single track while moving the element.
   *
   */
  const handleDrag = (e: MouseEvent) => {
    if ($draggable.event !== "start" || !$draggable.origin) return;
    if (Math.sqrt(Math.pow(e.clientX - $draggable.origin.pos.x, 2) + Math.pow(e.clientY - $draggable.origin.pos.y, 2)) < 15) return;
    $draggable.event = "drag";
  };

  const endDrag = (e: MouseEvent) => {
    if ($draggable.event !== "drag" || !$draggable.origin) return;
    else {
      // TODO: remove magic padding number
      if (!$draggable.media) return;
      const media = $draggable.media;

      let baseClip = {
        mediaUUID: media.uuid,
        linkUUID: null,
        metadata: {
          duration: media.type === "image" ? 5 : media.metadata.duration,
          runtime: media.type === "image" ? 5 : media.metadata.duration,
          offset: (e.clientX - 22) / $secondWidth + scrollX / $secondWidth,
          start: 0,
          trackIdx: currTrackIdx,
          title: media.metadata.title,
          z: z++,
        },
        src: media.src,
      } as Omit<App.Clip, "uuid" | "type">;

      if (media.type === "video") {
        const audioClip: App.AudioClip = {
          ...baseClip,
          uuid: uuidv4(),
          type: "audio",
        };

        const videoClip: App.VideoClip = {
          ...baseClip,
          buffer: null,
          uuid: uuidv4(),
          type: "video",
        };

        audioClip.linkUUID = videoClip.uuid;
        videoClip.linkUUID = audioClip.uuid;

        $timeline.clips.audio[currTrackIdx] = $timeline.clips.audio[currTrackIdx].set(audioClip.uuid, audioClip);
        $timeline.clips.video[currTrackIdx] = $timeline.clips.video[currTrackIdx].set(videoClip.uuid, videoClip);
      }

      if (media.type === "audio") {
        const uuid = uuidv4();
        $timeline.clips.audio[currTrackIdx] = $timeline.clips.audio[currTrackIdx].set(uuid, {
          ...baseClip,
          uuid,
          type: "audio",
        });
      }
      if (media.type === "image") {
        const uuid = uuidv4();
        $timeline.clips.video[currTrackIdx] = $timeline.clips.video[currTrackIdx].set(uuid, {
          ...baseClip,
          buffer: null,
          uuid,
          type: "image",
        });
      }
    }
    $timeline.clips = $timeline.clips;
  };

  const handleKey = (e: KeyboardEvent & { currentTarget: EventTarget & Window }) => {
    if (e.key !== "Delete" || selected.length === 0) return;
    const flattenedTracks = [
      ...$timeline.clips.video.map((map) => Array.from(map.values())).flat(),
      ...$timeline.clips.audio.map((map) => Array.from(map.values())).flat(),
    ];
    const links = selected.map((uuid) => flattenedTracks.find((clip) => clip.uuid === uuid)?.linkUUID).filter((uuid) => uuid !== undefined) as string[];

    links.forEach((uuid) => $timeline.clips.video.forEach((track) => track.delete(uuid)));
    links.forEach((uuid) => $timeline.clips.audio.forEach((track) => track.delete(uuid)));

    selected.forEach((uuid) => $timeline.clips.video.forEach((track) => track.delete(uuid)));
    selected.forEach((uuid) => $timeline.clips.audio.forEach((track) => track.delete(uuid)));

    $timeline.clips = $timeline.clips;
    selected = [];
  };
</script>

<svelte:window on:click={() => (selected = [])} on:keydown={handleKey} />

<div
  class="overflow-x-scroll h-full w-full overflow-y-hidden"
  on:scroll={(e) => (scrollX = e.currentTarget.scrollLeft)}
  on:mousemove={handleDrag}
  on:mouseup={endDrag}
  on:mouseenter={() => ($draggable.region = "timeline")}
  on:mouseleave={() => ($draggable.region = null)}
>
  <!-- video tracks -->
  <div class="overflow-y-scroll flex flex-col-reverse min-w-full h-1/2">
    {#each $timeline.clips.video as clips, idx}
      <section class="relative w-full min-h-[4rem] h-20 max-h-[6rem] border-b-[1px] border-neutral-600">
        <div class="w-48 p-2 h-full border-r-[1px] border-neutral-600 flex items-center justify-start">
          <p class="text-neutral-400 absolute font-mono">Video ({idx})</p>
        </div>
        <div
          on:mousedown={(e) => setupDrag(e, idx, "video")}
          on:mouseenter={() => {
            currTrackIdx = idx;
            currTrackType = "video";
          }}
        >
          {#each [...clips.values()] as clip (clip.uuid)}
            <Clip {clip} bind:selected />
          {/each}
        </div>
      </section>
    {/each}
  </div>
  <hr class="border-2 border-neutral-500" />
  <!-- audio tracks -->
  <div class="overflow-y-scroll flex flex-col min-w-full h-1/2">
    {#each $timeline.clips.audio as clips, idx}
      <section class="relative w-full min-h-[4rem] h-20 max-h-[6rem] border-b-[1px] border-neutral-600">
        <div class="w-48 p-2 h-full border-r-[1px] border-neutral-600 flex items-center justify-start">
          <p class="text-neutral-400 absolute font-mono">Audio ({idx})</p>
        </div>
        <div
          on:mousedown={(e) => setupDrag(e, idx, "audio")}
          on:mouseenter={() => {
            currTrackIdx = idx;
            currTrackType = "audio";
          }}
        >
          {#each [...clips.values()] as clip (clip.uuid)}
            <Clip {clip} bind:selected />
          {/each}
        </div>
      </section>
    {/each}
  </div>
</div>
