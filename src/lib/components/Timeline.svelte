<script lang="ts">
  import { timeline, studio } from "$lib/stores";
  import { v4 as uuidv4 } from "uuid";
  import MediaVideoPreview from "./mediaPreview/MediaVideoPreview.svelte";
  import MediaAudioPreview from "./mediaPreview/MediaAudioPreview.svelte";
  import TimelinePreview from "./mediaPreview/TimelinePreview.svelte";
  import { isAudioMedia, isVideoMedia } from "./util/helpers";

  let zoomScale = 5;
  let timelineContainer: HTMLElement;

  let dropIndex: number = -1;

  $: $timeline.zoomScale = zoomScale;

  const handleDrag = (e: MouseEvent) => {
    if ($studio.draggable.event !== "drag" || $studio.draggable.current.region !== "timeline") return;

    // get the element to place our element before
    const afterElement = [...timelineContainer.querySelectorAll(".draggable:not(.dragging)")].reduce(
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
    let dropXPosition = -1;
    if (afterElement == null) {
      dropIndex = -1;
      if (timelineContainer.children.length > 0)
        dropXPosition = timelineContainer.children[timelineContainer.children.length - 1].getBoundingClientRect().right;
      else dropXPosition = timelineContainer.getBoundingClientRect().left;
    } else {
      dropIndex = [...timelineContainer.querySelectorAll(".draggable:not(.dragging)")].indexOf(afterElement);
      dropXPosition = afterElement.getBoundingClientRect().left;
    }

    // update ghost position and size
    $studio.draggable.ghost.pos.set({
      x: dropXPosition,
      y: timelineContainer.getBoundingClientRect().top,
    });
    $studio.draggable.ghost.size.set({ width: 8, height: timelineContainer.getBoundingClientRect().height });
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

    if (!$studio.draggable.media) return;
    const draggable = $studio.draggable.media as App.VideoMedia | App.AudioMedia | App.ImageMedia;

    let duration = 3;
    if (isVideoMedia(draggable) || isAudioMedia(draggable)) {
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
</script>

<svelte:window on:keydown={handleKey} on:click={() => ($timeline.selected = [])} />

<div class="relative w-full h-full overflow-x-auto flex items-center" on:mousemove={handleDrag}>
  <div class="w-2/5 h-full bg-neutral-900 border-r-2 border-r-neutral-700 flex-shrink-0" />
  <div
    class="w-full h-full flex items-center"
    on:mouseup={handleDragEnd}
    on:mouseenter={() => ($studio.draggable.current.region = "timeline")}
    on:mouseleave={() => ($studio.draggable.current.region = null)}
  >
    <div class="flex h-fit min-h-[50%]" bind:this={timelineContainer}>
      {#each $timeline.timeline.toArray() as node, idx (node.uuid)}
        <div
          class="draggable overflow-clip"
          class:dragging={idx === $timeline.dragIndex && $studio.draggable.event === "drag"}
          class:w-0={idx === $timeline.dragIndex && $studio.draggable.event === "drag"}
        >
          <TimelinePreview {node}>
            {#if node.type === "video"}
              <MediaVideoPreview mediaUUID={node.mediaUUID} isTimelineElement={true} />
              <MediaAudioPreview
                mediaUUID={node.mediaUUID}
                metadata={{
                  start: node.metadata.start,
                  end: node.metadata.end,
                }}
              />
            {:else if node.type === "audio"}
              <div class="h-full" />
              <MediaAudioPreview mediaUUID={node.mediaUUID} metadata={{ start: node.metadata.start, end: node.metadata.end }} />
            {:else if node.type === "image"}
              <MediaVideoPreview mediaUUID={node.mediaUUID} isTimelineElement={true} />
              <div class="h-full" />
            {/if}
          </TimelinePreview>
        </div>
      {/each}
    </div>
  </div>
  <input class="absolute top-2 right-2" type="range" min="1" max="10" bind:value={zoomScale} />
</div>
