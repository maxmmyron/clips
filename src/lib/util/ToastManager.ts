import {v4 as uuidv4} from "uuid";
import { get } from "svelte/store";
import { studio } from "$lib/stores";

export const createToast = (level, duration, message) => {
    const uuid = new uuidv4();

    get(studio).toasts.push({
        uuid,
        level,
        message,
        timeoutID: setTimeout(() => {
            const idx = get(studio).toasts.findIndex(el => el.uuid === uuid);
            get(studio).toasts.splice(idx, 1);
        }, duration) 
    });
};