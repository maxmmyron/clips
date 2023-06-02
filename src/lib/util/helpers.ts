export function isVideoMedia(media: App.VideoMedia | App.ImageMedia | App.AudioMedia): media is App.VideoMedia {
  return media.type === "video";
}

export function isAudioMedia(media: App.VideoMedia | App.ImageMedia | App.AudioMedia): media is App.AudioMedia {
  return media.type === "audio";
}

export function isImageMedia(media: App.VideoMedia | App.ImageMedia | App.AudioMedia): media is App.ImageMedia {
  return media.type === "image";
}

export function isNodeVideoMedia(media: App.Node<"video" | "image" | "audio">): media is App.Node<"video"> {
  return media.type === "video";
}

export function isNodeAudioMedia(media: App.Node<"video" | "image" | "audio">): media is App.Node<"audio"> {
  return media.type === "audio";
}

export function isNodeImageMedia(media: App.Node<"video" | "image" | "audio">): media is App.Node<"image"> {
  return media.type === "image";
}
