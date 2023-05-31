export async function assertBrowserSupportsContainer(mimeType: string): Promise<boolean> {
    if(mimeType.includes("video") || mimeType.includes("audio")) return assertMediaContainerSupport(mimeType);
    if(mimeType.includes("image")) return await assertImageContainerSupport(mimeType);
    return false;
}

const assertMediaContainerSupport = (mimeType: string) => {
    const canPlayMIME = document.createElement('video').canPlayType(mimeType);
    return canPlayMIME === 'maybe' || canPlayMIME === 'probably';
}

const assertImageContainerSupport = async (mimeType: string) => {
    // just check for avif because support is still a little shaky (<90%)
    if(mimeType.includes("avif")) {
        const avif = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUEAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABYAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgSAAAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB5tZGF0EgAKBzgADlAgIGkyCR/wAABAAACvcA==";
        return await fetch(avif).then(res => res.blob()).then(blob => createImageBitmap(blob).then(() => true)).catch(() => false);
    } else return true;
}
