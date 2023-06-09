<script lang="ts">
  let clazz = "";
  export { clazz as class };

  let containerWidth: number, nameWidth: number;
  $: shouldNameAnimate = nameWidth > containerWidth;
  $: nameOffset = containerWidth - nameWidth - 16;
</script>

<div class="marquee overflow-clip {clazz}" bind:clientWidth={containerWidth}>
  <p
    style="--overflow-scroll-pos: {nameOffset}px"
    class="relative text-neutral-200 font-mono m-0 w-max {shouldNameAnimate && 'animate'}"
    bind:clientWidth={nameWidth}
  >
    <slot />
  </p>
</div>

<style>
  .animate {
    animation: name-scroll 7.5s linear infinite alternate;
  }

  @keyframes name-scroll {
    0% {
      left: 0px;
    }
    25% {
      left: 0px;
    }
    75% {
      left: var(--overflow-scroll-pos);
    }
    100% {
      left: var(--overflow-scroll-pos);
    }
  }
</style>
