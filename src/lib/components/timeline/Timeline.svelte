<script lang="ts">
  import { timeline, player, draggable } from "$lib/stores";
  import { v4 as uuidv4 } from "uuid";
  import MediaVideoPreview from "../preview/MediaVideoPreview.svelte";
  import MediaAudioPreview from "../preview/MediaAudioPreview.svelte";
  import TimelinePreview from "../preview/TimelinePreview.svelte";
  import { onMount } from "svelte";
  import Scrubber from "./Scrubber.svelte";
  import Ticks from "./Ticks.svelte";

  let timelineElementContainer: HTMLDivElement, timelineContainer: HTMLDivElement;
  let canMoveScrubber = false;
  let scrollX = 0;

  let dropIndex: number = -1;
  export let dragIndex: number;

  /**
   * an array of selected clip UUIDs
   */
  let selected: string[] = [];

  let lastPauseState = false;

  $: $timeline.duration = $timeline.clips.toArray().reduce((acc, { metadata }) => acc + (metadata.duration - metadata.start - metadata.end), 0);
  $: secondWidth = (timelineContainer?.clientWidth ?? 0) / 5;

  let lastTimestamp = 0;
  const renderTimeline = (timestamp: number) => {
    let curr = $timeline.clips.head;
    // find the currently rendering node given the runtime
    let previousNodeOffset = 0;
    while (curr && previousNodeOffset + (curr.metadata.duration - curr.metadata.start - curr.metadata.end) < $timeline.runtime) {
      previousNodeOffset += curr.metadata.duration - curr.metadata.start - curr.metadata.end;
      curr = curr.next;
    }
    $timeline.currentNodeRuntime = curr !== null ? $timeline.runtime - previousNodeOffset : 0;
    if ($timeline.current !== curr) $timeline.current = curr;

    if ($player.isPaused) {
      lastTimestamp = timestamp;
      requestAnimationFrame(renderTimeline);
      return;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    $timeline.runtime += delta / 1000;

    requestAnimationFrame(renderTimeline);
  };

  onMount(() => requestAnimationFrame(renderTimeline));

  const handleDrag = (e: MouseEvent) => {
    if ($draggable.event !== "drag" || $draggable.region !== "timeline") return;

    // get the element to place our element before
    const afterElement = [...timelineElementContainer.querySelectorAll(".draggable:not(.dragging)")].reduce(
      (accumulator, currChild) => {
        const childBounds = currChild.getBoundingClientRect();
        const offset = e.clientX - childBounds.left - childBounds.width / 2;
        if (offset < 0 && offset > accumulator.offset) {
          return { offset, el: currChild };
        } else {
          return { offset: accumulator.offset, el: accumulator.el };
        }
      },
      { el: null as Element | null, offset: Number.NEGATIVE_INFINITY }
    ).el;

    // get nearest spot to position ghost
    let dropXPosition = 0;
    if (afterElement == null) {
      dropIndex = -1;
      if (timelineElementContainer.children.length > 0)
        dropXPosition = timelineElementContainer.children[timelineElementContainer.children.length - 1].getBoundingClientRect().right;
      else dropXPosition = timelineElementContainer.getBoundingClientRect().left;
    } else {
      dropIndex = [...timelineElementContainer.querySelectorAll(".draggable:not(.dragging)")].indexOf(afterElement);
      dropXPosition = afterElement.getBoundingClientRect().left;
    }

    let width = 12;
    if ($draggable.origin?.region === "media_pool") {
      if ($draggable.media) {
        let duration = 3;

        if ($draggable.media.type === "video" || $draggable.media.type === "audio") {
          duration = $draggable.media.metadata.duration;
        }

        width = duration * $timeline.zoomScale;
      } else if (dragIndex !== -1) {
        const clip = $timeline.clips.getByIndex(dragIndex) as App.Node;
        width = clip.metadata.duration * $timeline.zoomScale;
      }
    }

    // update ghost position and size
    $draggable.ghost.pos.set({
      x: dropXPosition,
      y: timelineElementContainer.getBoundingClientRect().top,
    });
    $draggable.ghost.size.set({ width, height: timelineElementContainer.getBoundingClientRect().height });
  };

  const handleDragEnd = () => {
    if ($draggable.event === "start") return;
    if ($draggable.origin?.region === "timeline") {
      if (dragIndex === -1) return;

      let clip = $timeline.clips.getByIndex(dragIndex) as App.Node;
      $timeline.clips.remove(clip.uuid);

      if (dropIndex === -1) $timeline.clips.add(clip);
      else $timeline.clips.add(clip, dropIndex);

      dragIndex = -1;
      return;
    }
    // handle dragging new media into timeline

    if (!$draggable.media) return;
    const media = $draggable.media;

    let duration = 3;
    if (media.type === "video" || media.type === "audio") {
      duration = media.metadata.duration;
    }

    $timeline.clips.add({
      uuid: uuidv4(),
      mediaUUID: media.uuid,
      type: media.type,
      src: media.src,
      metadata: {
        title: media.metadata.title,
        duration: duration,
        start: 0,
        end: 0,
      },
      next: null,
      prev: null,
    });
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key !== "Delete") return;

    selected.forEach((uuid) => $timeline.clips.remove(uuid));

    selected = [];
  };

  const startUserScrubberMove = (e: MouseEvent) => {
    lastPauseState = $player.isPaused;
    $player.isPaused = true;
    if (selected.length > 0) return;
    canMoveScrubber = true;
    moveUserScrubber(e);
  };

  const moveUserScrubber = (e: MouseEvent) => {
    if (!canMoveScrubber) return;
    $timeline.runtime = Math.max(0, (e.clientX - timelineElementContainer.getBoundingClientRect().left) / (secondWidth / 2 ** (5 - $timeline.zoomScale)));
  };

  const endUserScrubberMove = (e: MouseEvent) => {
    $player.isPaused = lastPauseState;
    canMoveScrubber = false;
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => (selected = [])} />

<div class="relative w-full h-full">
  <Ticks {scrollX} />
  <div
    class="relative w-full h-full overflow-x-auto"
    on:mousemove={handleDrag}
    on:mousedown={startUserScrubberMove}
    on:mousemove={moveUserScrubber}
    on:mouseup={endUserScrubberMove}
    bind:this={timelineContainer}
    on:scroll={(e) => (scrollX = timelineContainer.scrollLeft)}
  >
    <div
      class="w-full h-full flex items-center"
      on:mouseup={handleDragEnd}
      on:mouseenter={() => ($draggable.region = "timeline")}
      on:mouseleave={() => ($draggable.region = null)}
    >
      <div class="relative flex h-fit min-h-[50%]" bind:this={timelineElementContainer}>
        {#each $timeline.clips.toArray() as node, idx (node.uuid)}
          <div
            class="draggable overflow-clip"
            class:dragging={idx === dragIndex && $draggable.event === "drag"}
            class:w-0={idx === dragIndex && $draggable.event === "drag"}
          >
            <TimelinePreview {node} timelineSecondWidth={secondWidth} bind:selected bind:dragIndex>
              {#if node.type === "video"}
                <MediaVideoPreview mediaUUID={node.mediaUUID} isTimelineElement={true} />
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
                <div class="h-1/2" />
                {#key $timeline.zoomScale || node.metadata.start || node.metadata.end}
                  <MediaAudioPreview mediaUUID={node.mediaUUID} metadata={{ start: node.metadata.start, end: node.metadata.end }} />
                {/key}
              {:else if node.type === "image"}
                <MediaVideoPreview mediaUUID={node.mediaUUID} isTimelineElement={true} />
                <div class="h-1/2" />
              {/if}
            </TimelinePreview>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <Scrubber {scrollX} timelineSecondWidth={secondWidth} />
</div>
