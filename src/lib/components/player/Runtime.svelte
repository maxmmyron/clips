<script lang="ts">
  import { timeline } from "$lib/stores";

  const timingRules: ((arg0: number) => number)[] = [(runtime) => runtime / 3600, (runtime) => (runtime % 3600) / 60, (runtime) => runtime % 60];
</script>

<div class="flex justify-end">
  {#each timingRules as r, i}
    <p class="text-neutral-200 font-mono">
      {Math.floor(r($timeline.runtime)).toString().padStart(2, "0")}:
    </p>
  {/each}
  <p class="text-neutral-200 font-mono">
    {Math.round(($timeline.runtime % 1) * 1000)
      .toString()
      .padStart(3, "0")
      .slice(0, 3)}
  </p>
</div>
