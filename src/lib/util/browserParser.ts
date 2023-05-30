export function assertBrowserSupportsContainer(mimeType: string) {
    if (!mimeType.includes("video") && !mimeType.includes("audio")) {
        throw new Error("Unsupported container");
    }
}
