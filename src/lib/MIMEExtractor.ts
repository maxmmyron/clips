export function logFewBytes(file: File) {
    const r = new FileReader();
    r.onloadend = () => console.log(Array.from(new Uint8Array(r.result as ArrayBuffer).slice(0, 4)).map(b => b.toString(16).padStart(2, "0")).join(""));
    r.readAsArrayBuffer(file.slice(0, 8));
}

// image

// png magic numbers: 89 50 4E 47
// jpeg magic numbers: FF D8 FF (E0/E1/E2/E3/E8)

// video


// audio
