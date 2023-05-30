const mimeTypes: {[key: string]: {offset: number, magic: string[]}} = {
  // *****************
  // image
  // *****************

  // PNG
  "image/png": {
    offset: 0,
    magic: ["89504e47"]
  },

  // JPG
  "image/jpeg": {
    offset: 0,
    // TODO: confirm mime types
    magic: ["ffd8ffdb", "ffd8ffe0", "ffd8ffe1", "ffd8ffe2", "ffd8ffe3", "ffd8ffe8"]
  },

  // *****************
  // audio
  // *****************

  // MP3
  "audio/mpeg": {
    offset: 0,
    magic: ["fffb", "fff3", "fff2", "494433"]
  },

  // ogg
  "audio/ogg": {
    offset: 0,
    magic: ["4f676753"],
  },


  // *****************
  // video
  // *****************

  // MP4
  "video/mp4": {
    offset: 4,
    magic: ["6674797069736F6D"],
  },

  "video/m4v": {
    offset: 4,
    magic: ["667479706D703432"],
  }

}

const awaitReader = async (file: File, offset: number, length: number) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
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
    for (const [mimeType, {offset, magic}] of Object.entries(mimeTypes)) {
      for (const m of magic) {
        const bytes = await awaitReader(file, offset, m.length / 2);

        if (bytes === m.toLowerCase()) {
          return mimeType;
        }
      }
    }

    return "file/unknown";
};
