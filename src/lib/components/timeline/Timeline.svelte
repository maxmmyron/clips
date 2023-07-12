<script lang="ts">
  import { draggable, player, secondWidth, timeline } from "$lib/stores";
  import { v4 as uuidv4 } from "uuid";
  import TimelinePreview from "../preview/TimelinePreview.svelte";
  import MediaAudioPreview from "../preview/MediaAudioPreview.svelte";
  import MediaVideoPreview from "../preview/MediaVideoPreview.svelte";
  import Clip from "../preview/Clip.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  export let dragIndex: number;
  export let scrollX: number = 0;

  let startTrackIdx = -1, currTrackIdx = -1;
  let startTrackType: "video" | "audio" = "video", currTrackType: "video" | "audio" = "video";

  /**
   * uuids of selected timeline clips
   */
  let selected: string[] = [];

  let z = 0;

  let lastTimestamp = 0;
  const render = (timestamp: number) => {
    if ($player.isPaused) {
      lastTimestamp = timestamp;
      requestAnimationFrame(render);
      return;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    $timeline.runtime += delta / 1000;

    requestAnimationFrame(render);
  };

  onMount(() => requestAnimationFrame(render));

  $: browser && (window.timeline = $timeline.clips);

  $: getCurrentTrackClip = (track: Map<string, App.Clip>) => {
    let validClips = [];
    for (const [uuid, clip] of [...track]) {
      if (clip.metadata.offset < $timeline.runtime && clip.metadata.offset + clip.metadata.duration > $timeline.runtime) validClips.push(clip);
      if (clip.metadata.offset > $timeline.runtime) break;
    }
    return validClips.sort((a, b) => b.metadata.z - a.metadata.z)[0];
  }

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
          uuid, 
          type: "image",
        });
      }
    }
    $timeline.clips = $timeline.clips;
  };

  const handleKey = (e: KeyboardEvent & { currentTarget: EventTarget & Window }) => {
    if (e.key !== "Delete" || selected.length === 0) return;
    const flattenedTracks = [...$timeline.clips.video.map(map => Array.from(map.values())).flat(), ...$timeline.clips.audio.map(map => Array.from(map.values())).flat()];
    const links = selected.map((uuid) => flattenedTracks.find((clip) => clip.uuid === uuid)?.linkUUID).filter((uuid) => uuid !== undefined) as string[];

    links.forEach(uuid => $timeline.clips.video.forEach((track) => track.delete(uuid)));
    links.forEach(uuid => $timeline.clips.audio.forEach((track) => track.delete(uuid)));

    selected.forEach(uuid => $timeline.clips.video.forEach((track) => track.delete(uuid)));
    selected.forEach(uuid => $timeline.clips.audio.forEach((track) => track.delete(uuid)));

    $timeline.clips = $timeline.clips;
    selected = [];
  };
</script>

<svelte:window on:click={() => (selected = [])} on:keydown={handleKey} />

<div
  class="overflow-x-auto h-full"
  on:scroll={(e) => (scrollX = e.currentTarget.scrollLeft)}
  on:mousemove={handleDrag}
  on:mouseup={endDrag}
  on:mouseenter={() => ($draggable.region = "timeline")}
  on:mouseleave={() => ($draggable.region = null)}
>
  <!-- video tracks -->
  <div class="overflow-y-auto flex flex-col-reverse justify-end w-full h-1/2">
    {#each $timeline.clips.video as clips, idx}
      <div class="w-full h-24 border-t-[1px] border-neutral-600" on:mousedown={(e) => setupDrag(e, idx, "video")} on:mouseenter={() => {
        currTrackIdx = idx;
        currTrackType = "video";
      }}>
        <p class="text-neutral-400 absolute">v{idx}</p>
        {#each [...clips.values()] as clip, idx (clip.uuid)}
          <Clip {clip} bind:selected />
        {/each}
      </div>
      
    {/each}
  </div>
  <hr class="border-2 border-white">
  <!-- audio tracks -->
  <div class="overflow-y-auto flex flex-col w-full h-1/2">
    {#each $timeline.clips.audio as clips, idx}
      <div class="w-full h-24 border-b-[1px] border-neutral-600" on:mousedown={(e) => setupDrag(e, idx, "audio")} on:mouseenter={() => {
        currTrackIdx = idx;
        currTrackType = "audio";
      }}>
        <p class="text-neutral-400 absolute">a{idx}</p>
        {#each [...clips.values()] as clip, idx (clip.uuid)}
          <Clip {clip} bind:selected />
        {/each}
      </div>
    {/each}
  </div>

  <!-- <TimelinePreview bind:dragIndex {node} bind:selected>
    {#if node.type === "video"}
      <MediaVideoPreview mediaUUID={node.mediaUUID} isTimelineElement />
      {#key $timeline.zoomScale || node.metadata.start || node.metadata.end}
        <MediaAudioPreview
          mediaUUID={node.mediaUUID}
          metadata={{
            start: node.metadata.start,
            end: node.metadata.end,
          }}
        />
      {/key}
    {:else if node.type === "audio"}
      {#key $timeline.zoomScale || node.metadata.start || node.metadata.end}
        <MediaAudioPreview mediaUUID={node.mediaUUID} metadata={{ start: node.metadata.start, end: node.metadata.end }} />
      {/key}
    {:else if node.type === "image"}
      <MediaVideoPreview mediaUUID={node.mediaUUID} isTimelineElement />
    {/if}
  </TimelinePreview> -->
</div>
