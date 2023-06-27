<script lang="ts">
    import { toasts } from "$lib/stores";
    import Icon from "./Icon.svelte";

    export let toast: App.Toast;

    const removeToast = () => {
        // remove timeout before expiration
        clearTimeout(toast.timeoutID);

        const idx = $toasts.findIndex((t) => t.uuid === toast.uuid);
        $toasts.splice(idx, 1);
        $toasts = [...$toasts];
    };
</script>

<div class="min-w-[24rem] w-fit max-w-lg min-h-[4rem] bg-gradient-to-b from-neutral-800 to-{neutral}-900 border-2 border-neutral-700 rounded-md p-4 shadow-lg">
    <div class="w-full h-5 flex justify-between items-center mb-4">
        <!-- This doesn't have to be in an img wrapper el because toast level color not light/dark dependent -->
        <Icon src="/icons/{toast.level}.svg" />
        <button on:click={removeToast}>
            <Icon src="/icons/close.svg" />
        </button>
    </div>
    <p class="text-white">{toast.message}</p>
</div>
