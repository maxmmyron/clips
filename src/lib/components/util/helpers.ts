export function isVideoMedia(media: App.VideoMedia | App.ImageMedia | App.AudioMedia): media is App.VideoMedia {
  return media.type === "video";
}

export function isAudioMedia(media: App.VideoMedia | App.ImageMedia | App.AudioMedia): media is App.AudioMedia {
  return media.type === "audio";
}

export function isImageMedia(media: App.VideoMedia | App.ImageMedia | App.AudioMedia): media is App.ImageMedia {
  return media.type === "image";
}
