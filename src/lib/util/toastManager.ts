import { v4 as uuidv4 } from "uuid"
import { toasts } from "$lib/stores"

export const addToast = (level: "info" | "warning" | "error", message: string, duration = 7000) => {
  const uuid = uuidv4()
  toasts.update(toastsArr => [...toastsArr, { uuid, level, message, timeoutID: setTimeout(() => toasts.update(toastsArr => toastsArr.filter(toast => toast.uuid !== uuid)), duration) }])
}
