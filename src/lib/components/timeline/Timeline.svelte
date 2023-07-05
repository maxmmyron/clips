<script lang="ts">
  export let dragIndex: number;
  export let scrollX: number = 0;
</script>

<div class="overflow-x-auto flex-grow h-full" on:scroll={(e) => (scrollX = e.currentTarget.scrollLeft)}>
  <div class="w-[200%] h-32 bg-orange-200 rounded-2xl" />
</div>
