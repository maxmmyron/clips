<script lang=ts context=module>
    export let toasts: Toast[];

    export const createToast = createToast = (level, duration, message) => {
    const uuid = new uuidv4();

    toasts.push({
        uuid,
        level,
        message,
        timeoutID: setTimeout(() => {
            const idx = toasts.findIndex(el => el.uuid === uuid);
            toasts.splice(idx, 1);
        }, duration) 
    });
}; 
</script>

<script lang=ts>
    import { fly } from "svelte/transition";

    export let toast: Toast;

    const removeToast = () => {
        // remove timeout before expiration
        clearTimeout(toast.timeoutID);

        const idx = toasts.findIndex(t => t.uuid === toast.uuid);
        toasts.splice(idx, 1);
    };
</script>

<div class="w-sm min-h-[4rem] bg-slate-800 border-2 border-bg-slate-700 p-4">
    <div class="w-full h-5 flex justify-between items-center mb-4">
        <!-- This doesn't have to be in an img wrapper el because toast level color not light/dark dependent -->
        <img src="/static/{toast.level}.svg" alt="{toast.level}" />
        <button on:click={removeToast}>
            <!-- TODO: replace w/ image wrapper el -->
            <img src="/static/close.svg" alt="Close Toast" class="w-5 h-5"/>
        </button>
    </div>
    <p class="text-white">{toast.message}</p>
</div>
