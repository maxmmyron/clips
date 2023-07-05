<script lang="ts">
  import { draggable, secondWidth, timeline } from "$lib/stores";
  import { v4 as uuidv4 } from "uuid";
  import TimelinePreview from "../preview/TimelinePreview.svelte";

  export let dragIndex: number;
  export let scrollX: number = 0;

  /**
   * uuids of selected timeline clips
   */
  let selected: string[] = [];

  const setupDrag = (e: MouseEvent) => {
    if (e.button !== 0) return;
    $draggable.event = "start";
    $draggable.origin = { pos: { x: e.clientX, y: e.clientY }, region: "timeline" };
  };

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
      if (!$draggable.media) return;
      const media = $draggable.media;
      $timeline.clips.add({
        uuid: uuidv4(),
        mediaUUID: media.uuid,
        metadata: {
          duration: media.type !== "image" ? media.metadata.duration : 5,
          start: 0,
          end: 0,
          title: media.metadata.title,
        },
        next: null,
        prev: null,
        src: media.src,
        type: media.type,
      });
    }
    $timeline.clips = $timeline.clips;
  };

  const calculateReorder = () => {
    console.log("reorder");
  };

  const handleKey = (e: KeyboardEvent & { currentTarget: EventTarget & Window }) => {
    if (e.key !== "Delete" || selected.length === 0) return;
    selected.forEach((uuid) => $timeline.clips.remove(uuid));
    $timeline.clips = $timeline.clips;
    selected = [];
  };
</script>

<svelte:window on:click={() => (selected = [])} on:keydown={handleKey} />

<div
  class="overflow-x-auto flex-grow h-full flex"
  on:scroll={(e) => (scrollX = e.currentTarget.scrollLeft)}
  on:mousedown={setupDrag}
  on:mousemove={handleDrag}
  on:mouseup={endDrag}
  on:mouseenter={() => ($draggable.region = "timeline")}
  on:mouseleave={() => ($draggable.region = null)}
>
  {#each $timeline.clips.toArray() as node, idx (node.uuid)}
    <TimelinePreview bind:dragIndex {node} bind:selected />
  {/each}
</div>
