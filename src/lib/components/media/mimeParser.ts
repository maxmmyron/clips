const mimeTypes: {[key: string]: {offset: number, magic: string[], mask?: string}} = {
  // *****************
  // image
  // *****************

  // AVIF
  "image/avif": {
    offset: 4,
    magic: ["6674797068656906", "667479706D696631", "667479706D736631", "6674797061766966"],
  },

  // BMP
  "image/bmp": {
    offset: 0,
    magic: ["424d"],
  },

  // GIF
  "image/gif": {
    offset: 0,
    magic: ["474946383761", "474946383961"],
  },

  // JPG
  "image/jpeg": {
    offset: 0,
    magic: ["ffd8ffdb", "ffd8ffe0", "ffd8ffe1", "ffd8ffe2", "ffd8ffe3", "ffd8ffe8"]
  },

  // PNG
  "image/png": {
    offset: 0,
    magic: ["89504e47"]
  },

  // SVG
  "image/svg+xml": {
    offset: 0,
    magic: ["3c737667"]
  },

  // TIFF
  "image/tiff": {
    offset: 0,
    magic: ["49492a00", "4d4d002a"]
  },

  // WEBP
  "image/webp": {
    offset: 8,
    magic: ["57454250"]
  },

  // *****************
  // audio
  // *****************

  "audio/aiff": {
    offset: 0,
    magic: ["464f524d0000000041494646"],
    mask: "FFFFFFFF00000000FFFFFFFF",
  },

  "audio/flac": {
    offset: 0,
    magic: ["664c6143"]
  },

  // MP3
  "audio/mpeg": {
    offset: 0,
    magic: ["fffb", "fff3", "fff2", "494433"]
  },

  // opus
  "audio/opus": {
    offset: 0,
    magic: ["4F70757348656164"],
  },

  // wav
  "audio/wav": {
    offset: 0,
    magic: ["524946460000000057415645"],
    mask: "FFFFFFFF00000000FFFFFFFF"
  },

  // *****************
  // video
  // *****************

  // AVI
  "video/avi": {
    offset: 0,
    magic: ["524946460000000041564920"],
    mask: "FFFFFFFF00000000FFFFFFFF"
  },

  // MP4 (ISOBMFF)
  "video/mp4": {
    offset: 4,
    magic: ["6674797069736F6D", "667479704D534E56"],
  },

  // MPEG
  "video/mpeg": {
    offset: 0,
    magic: ["000001ba", "000001b3"],
  },

  // m4v
  "video/x-m4v": {
    offset: 4,
    magic: ["667479706D703432", " 667479704D345620"],
  },

  // quicktime
  "video/quicktime": {
    offset: 4,
    magic: ["667479706d703432", "6674797071742020"],
  },

  // matroska format & WebM
  "video/x-matroska": {
    offset: 0,
    magic: ["1a45dfa3"],
  },
}

const awaitReader = async (file: File, offset: number, length: number) => {
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const bytes = Array.from(new Uint8Array(reader.result as ArrayBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
      resolve(bytes);

      // destroy reader
      reader.onloadend = null;
      reader.onerror = null;
    }

    reader.onerror = reject;

    reader.readAsArrayBuffer(file.slice(offset, offset + length));
  });
}

export async function parseMIME (file: File): Promise<string> {
    for (const [mimeType, {offset, magic, mask}] of Object.entries(mimeTypes)) {
      for (const m of magic) {
        let bytes = await awaitReader(file, offset, m.length / 2);
        bytes = mask ? Array.from(mask).map((b, i) => b === "F" ? bytes[i] : b).join("") : bytes;

        if (bytes === m.toLowerCase()) {
          return mimeType;
        }
      }
    }

    return "file/unknown";
};
