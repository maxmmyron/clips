<script lang="ts">
    import { toasts } from "$lib/stores";
    import { fly } from "svelte/transition";

    export let toast: App.Toast;

    const removeToast = () => {
        // remove timeout before expiration
        clearTimeout(toast.timeoutID);

        const idx = $toasts.findIndex((t) => t.uuid === toast.uuid);
        $toasts.splice(idx, 1);
        $toasts = [...$toasts];
    };
</script>

<div class="w-sm min-h-[4rem] bg-slate-800 border-2 border-bg-slate-700 p-4" in:fly={{ x: "100%" }} out:fly={{ x: "100%" }}>
    <div class="w-full h-5 flex justify-between items-center mb-4">
        <!-- This doesn't have to be in an img wrapper el because toast level color not light/dark dependent -->
        <img src="/static/{toast.level}.svg" alt={toast.level} />
        <button on:click={removeToast}>
            <img src="/static/close.svg" alt="Close Toast" class="w-5 h-5" />
        </button>
    </div>
    <p class="text-white">{toast.message}</p>
</div>
