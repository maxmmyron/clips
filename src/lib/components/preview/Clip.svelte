<script lang="ts">
  import { secondWidth, studio } from "$lib/stores";

  export let clip: App.Clip;
  export let selected: string[];

  let mediaPreview: HTMLButtonElement;
  let isMove = false;
  let isResize = false;
  let resizeDirection: "left" | "right" = "left";

  /**
   * Initial X position of mouse within clip at start of move
   */
  let initialX = 0;

  $: isSelected = selected.includes(clip.uuid);

  const handleMove = () => {
    if(isMove) {
      clip.metadata.offset = ($studio.mouse.x - initialX) / $secondWidth;
      return
    }

    if(isResize) {
      // if left, resize based on mouse position between 0 and metadata.runtime
      if(resizeDirection == "left") {
        //clip.metadata.start = clip.metadata.start + Math.max(0, clip.metadata.start + ($studio.mouse.x - initialX)) / $secondWidth;
        return;
      }

      // if right, resize based on mouse position between metadata.start and metadata.duration
      if(resizeDirection == "right") {
        //clip.metadata.runtime = clip.metadata.runtime + Math.max(0, clip.metadata.runtime + ($studio.mouse.x - initialX)) / $secondWidth;
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
      resizeDirection = "left";
      initialX = e.clientX;
      return;
    }

    if(mediaPreview.getBoundingClientRect().right - e.clientX < 12) {
      isResize = true;
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
  before:absolute before:w-3 before:h-full before:left-0 before:top-0 before:hover:cursor-ew-resize
  after:absolute after:w-3 after:h-full after:right-0 after:top-0 after:hover:cursor-ew-resize"
  style="width: {clip.metadata.runtime * $secondWidth}px; transform: translateX({clip.metadata.offset * $secondWidth}px);"
  on:click|capture|stopPropagation={handleClick}
  on:mousedown={setupMove}
  bind:this={mediaPreview}
/>
