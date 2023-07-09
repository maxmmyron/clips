<script lang="ts">
  import { draggable, secondWidth, timeline } from "$lib/stores";
  import { v4 as uuidv4 } from "uuid";
  import TimelinePreview from "../preview/TimelinePreview.svelte";
  import MediaAudioPreview from "../preview/MediaAudioPreview.svelte";
  import MediaVideoPreview from "../preview/MediaVideoPreview.svelte";
  import Clip from "../preview/Clip.svelte";

  export let dragIndex: number;
  export let scrollX: number = 0;

  let startTrackIdx = -1, currTrackIdx = -1;
  let startTrackType: "video" | "audio" = "video", currTrackType: "video" | "audio" = "video";

  /**
   * uuids of selected timeline clips
   */
  let selected: string[] = [];

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
    console.log("end drag");
    if ($draggable.event !== "drag" || !$draggable.origin) return;
    if ($draggable.origin.region === "timeline") calculateReorder();
    else {
      // TODO: bro this shit SUCKS
      // TODO: also remove magic number
      if (!$draggable.media) return;
      const media = $draggable.media;
      if (media.type === "video") {
        $timeline.clips.audio[currTrackIdx] = [
          ...$timeline.clips.audio[currTrackIdx],
          {
            uuid: uuidv4(),
            mediaUUID: media.uuid,
            metadata: {
              duration: media.metadata.duration,
              runtime: media.metadata.duration,
              offset: (e.clientX - 22) / $secondWidth + scrollX / $secondWidth,
              start: 0,
              title: media.metadata.title,
            },
            src: media.src,
            type: "audio",
          },
        ];
        $timeline.clips.video[currTrackIdx] = [
          ...$timeline.clips.video[currTrackIdx],
          {
            uuid: uuidv4(),
            mediaUUID: media.uuid,
            metadata: {
              duration: media.metadata.duration,
              runtime: media.metadata.duration,
              offset: (e.clientX - 22) / $secondWidth + scrollX / $secondWidth,
              start: 0,
              title: media.metadata.title,
            },
            src: media.src,
            type: "video",
          },
        ];
      }
      if (media.type === "audio") {
        $timeline.clips.audio[currTrackIdx] = [
          ...$timeline.clips.audio[currTrackIdx],
          {
            uuid: uuidv4(),
            mediaUUID: media.uuid,
            metadata: {
              duration: media.metadata.duration,
              runtime: media.metadata.duration,
              offset: (e.clientX - 22) / $secondWidth + scrollX / $secondWidth,
              start: 0,
              title: media.metadata.title,
            },
            src: media.src,
            type: "audio",
          },
        ];
      }
      if (media.type === "image") {
        $timeline.clips.video[currTrackIdx] = [
          ...$timeline.clips.video[currTrackIdx],
          {
            uuid: uuidv4(),
            mediaUUID: media.uuid,
            metadata: {
              duration: 60,
              runtime: 5,
              offset: (e.clientX - 22) / $secondWidth + scrollX / $secondWidth,
              start: 27.5,
              title: media.metadata.title,
            },
            src: media.src,
            type: "video",
          },
        ];
      }
    }
    $timeline.clips = $timeline.clips;
  };

  const calculateReorder = () => {
    console.log("a reorder is in order lol");
  };

  const handleKey = (e: KeyboardEvent & { currentTarget: EventTarget & Window }) => {
    if (e.key !== "Delete" || selected.length === 0) return;
    selected.forEach((uuid) => $timeline.clips.video = $timeline.clips.video.map((track) => track.filter((clip) => clip.uuid !== uuid)));
    selected.forEach((uuid) => $timeline.clips.audio = $timeline.clips.audio.map((track) => track.filter((clip) => clip.uuid !== uuid)));
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
        {#each clips as clip, idx (clip.uuid)}
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
        {#each clips as clip, idx (clip.uuid)}
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
