<script lang="ts">
  let clazz = "";
  export { clazz as class };

  export let primaryColor: string = "neutral-900";
  export let secondaryColor: string = "gray-800";
  export let isSecondaryColor: boolean = false;

  let containerWidth: number, nameWidth: number;
  $: shouldNameAnimate = nameWidth > containerWidth;
</script>

<div
  class="relative marquee overflow-clip {clazz}

  {shouldNameAnimate ? "before:content-[''] before:w-5 before:h-full" : ''} before:z-10
  before:absolute before:top-0 before:left-0
  before:bg-gradient-to-r before:from-{isSecondaryColor ? secondaryColor : primaryColor} before:to-transparent before:transition-colors

  {shouldNameAnimate ? "after:content-[''] after:w-5 after:h-full" : ''} after:z-10
  after:absolute after:top-0 after:right-0
  after:bg-gradient-to-l after:from-{isSecondaryColor ? secondaryColor : primaryColor} after:to-transparent after:transition-colors

  {shouldNameAnimate ? 'animate-name-pseudo' : ''}"
  bind:clientWidth={containerWidth}
>
  <p
    style="--overflow-scroll-pos: {containerWidth - nameWidth - 8}px"
    class="relative text-neutral-200 font-mono m-0 w-max {shouldNameAnimate && 'animate'}"
    bind:clientWidth={nameWidth}
  >
    <slot />
  </p>
</div>

<style>
  .animate {
    animation: name-scroll 8s ease-in-out infinite alternate;
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

  .animate-name-pseudo::before {
    animation: 8s name-pseudo-pulse ease-in-out infinite alternate;
  }

  .animate-name-pseudo::after {
    animation: 8s name-pseudo-pulse ease-in-out infinite alternate-reverse;
  }

  @keyframes name-pseudo-pulse {
    0% {
      opacity: 0;
    }
    25% {
      opacity: 0;
    }
    30% {
      opacity: 1;
    }
    75% {
      opacity: 1;
    }
    100% {
      opacity: 1;
    }
  }
</style>
