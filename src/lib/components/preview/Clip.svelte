<script lang="ts">
  import { media, secondWidth, studio } from "$lib/stores";

  export let clip: App.Clip;
  export let selected: string[];

  let mediaPreview: HTMLButtonElement;
  let isMove = false, isResize = false;
  let initialResizePosition = 0, initialOffset = 0;
  let resizeDirection: "left" | "right" = "left";

  /**
   * Initial X position of mouse within clip at start of move
   */
  let initialX = 0;

  $: isSelected = selected.includes(clip.uuid);

  const handleMove = (e: MouseEvent) => {
    if(isMove) {
      clip.metadata.offset = ($studio.mouse.x - initialX) / $secondWidth;
      return
    }

    if(isResize) {  
      let offset;
      // if left, resize based on mouse position between 0 and metadata.runtime
      if(resizeDirection == "left") {
        offset = initialOffset + (e.clientX - initialResizePosition) / $secondWidth;
        clip.metadata.start = Math.max(0, offset);
        return;
      }

      // if right, resize based on mouse position between metadata.start and metadata.duration
      if(resizeDirection == "right") {
        offset = initialOffset - (initialResizePosition - e.clientX) / $secondWidth;
        clip.metadata.runtime = Math.min(offset, clip.metadata.duration);
        return;
      }
    }
  }

  const handleClick = (e: MouseEvent) => {
    if (e.shiftKey) selected = [...selected, clip.uuid];
    else selected = [clip.uuid];
  };

  const setupMove = (e: MouseEvent) => {
    if(e.clientX - mediaPreview.getBoundingClientRect().x < 12) {
      isResize = true;
      initialResizePosition = mediaPreview.getBoundingClientRect().left;
      initialOffset = clip.metadata.start;
      resizeDirection = "left";
      initialX = e.clientX;
      return;
    }

    if(mediaPreview.getBoundingClientRect().right - e.clientX < 12) {
      isResize = true;
      initialResizePosition = mediaPreview.getBoundingClientRect().right;
      initialOffset = clip.metadata.runtime;
      resizeDirection = "right";
      initialX = e.clientX;
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

<svelte:window on:mousemove={handleMove} on:mouseup={endMove}/>

<button
  class="absolute h-12 bg-neutral-800 rounded-lg {isSelected ? "border-neutral-600" : "border-neutral-700/50"} border-2 transition-colors 
  before:absolute before:w-4 before:h-full before:-left-1 before:top-0 before:hover:cursor-ew-resize
  after:absolute after:w-4 after:h-full after:-right-1 after:top-0 after:hover:cursor-ew-resize"
  style="width: {(clip.metadata.runtime - clip.metadata.start) * $secondWidth}px; transform: translateX({(clip.metadata.offset + clip.metadata.start) * $secondWidth}px);"
  on:click|capture|stopPropagation={handleClick}
  on:mousedown={setupMove}
  bind:this={mediaPreview}
/>
