<script lang="ts">
  import { timeline, studio, player, mediaPool } from "$lib/stores";
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

  $: $timeline.duration = $timeline.timeline.toArray().reduce((acc, { metadata }) => acc + (metadata.duration - metadata.start - metadata.end), 0);

  let lastTimestamp = 0;
  const renderTimeline = (timestamp: number) => {
    let curr = $timeline.timeline.head;
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
    if ($studio.draggable.event !== "drag" || $studio.draggable.current.region !== "timeline") return;

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
    if ($studio.draggable.origin?.region === "media_pool") {
      if ($studio.draggable.mediaUUID) {
        let duration = 3;
        const draggable = $mediaPool.media.find((media) => media.uuid === $studio.draggable.mediaUUID);
        if (!draggable) return;

        if (draggable.type === "video" || draggable.type === "audio") {
          duration = draggable.metadata.duration;
        }

        width = duration * $timeline.zoomScale;
      } else if ($timeline.dragIndex !== -1) {
        const clip = $timeline.timeline.getByIndex($timeline.dragIndex) as App.Node;
        width = clip.metadata.duration * $timeline.zoomScale;
      }
    }

    // update ghost position and size
    $studio.draggable.ghost.pos.set({
      x: dropXPosition,
      y: timelineElementContainer.getBoundingClientRect().top,
    });
    $studio.draggable.ghost.size.set({ width, height: timelineElementContainer.getBoundingClientRect().height });
  };

  const handleDragEnd = () => {
    if ($studio.draggable.event === "start") return;
    if ($studio.draggable.origin?.region === "timeline") {
      if ($timeline.dragIndex === -1) return;

      let clip = $timeline.timeline.getByIndex($timeline.dragIndex) as App.Node;
      $timeline.timeline.remove(clip.uuid);

      if (dropIndex === -1) $timeline.timeline.add(clip);
      else $timeline.timeline.add(clip, dropIndex);

      $timeline.dragIndex = -1;
      return;
    }
    // handle dragging new media into timeline

    if (!$studio.draggable.mediaUUID) return;
    const draggable = $mediaPool.media.find((media) => media.uuid === $studio.draggable.mediaUUID);
    if (!draggable) return;

    let duration = 3;
    if (draggable.type === "video" || draggable.type === "audio") {
      duration = draggable.metadata.duration;
    }

    $timeline.timeline.add({
      uuid: uuidv4(),
      mediaUUID: draggable.uuid,
      type: draggable.type,
      src: draggable.src,
      metadata: {
        title: draggable.metadata.title,
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

    $timeline.selected.forEach((uuid) => $timeline.timeline.remove(uuid));

    $timeline.selected = [];
  };

  const startUserScrubberMove = (e: MouseEvent) => {
    $player.lastPauseState = $player.isPaused;
    $player.isPaused = true;
    if ($timeline.selected.length > 0) return;
    canMoveScrubber = true;
    moveUserScrubber(e);
  };

  const moveUserScrubber = (e: MouseEvent) => {
    if (!canMoveScrubber) return;

    $timeline.runtime = Math.max(0, (e.clientX - timelineElementContainer.getBoundingClientRect().left) / $timeline.zoomScale);
  };

  const endUserScrubberMove = (e: MouseEvent) => {
    $player.isPaused = $player.lastPauseState;
    canMoveScrubber = false;
  };
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($timeline.selected = [])} />

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
      on:mouseenter={() => ($studio.draggable.current.region = "timeline")}
      on:mouseleave={() => ($studio.draggable.current.region = null)}
    >
      <div class="relative flex h-fit min-h-[50%]" bind:this={timelineElementContainer}>
        {#each $timeline.timeline.toArray() as node, idx (node.uuid)}
          <div
            class="draggable overflow-clip"
            class:dragging={idx === $timeline.dragIndex && $studio.draggable.event === "drag"}
            class:w-0={idx === $timeline.dragIndex && $studio.draggable.event === "drag"}
          >
            <TimelinePreview {node} timelineSecondWidth={timelineContainer.getBoundingClientRect().width / 5}>
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
  <Scrubber {scrollX} />
</div>
