import {v4 as uuidv4} from "uuid";

export const createToast = (level, duration, message) => {
    const uuid = new uuidv4();

    $studio.toasts.push({
        uuid,
        level,
        message,
        timeoutID: setTimeout(() => {
            const idx = $studio.toasts.findIndex(el => el.uuid === uuid);
            $studio.toasts.splice(idx, 1);
        }, duration) 
    });
};