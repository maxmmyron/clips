declare interface Window {
  media: {
    unresolved: {uuid:string, media:Promise<App.Media>}[],
    resolved: App.Media[]
  }
  timeline: App.Timeline;
  buffers: Map<string, { source: HTMLVideoElement | HTMLImageElement, type: Exclude<App.MediaTypes, "audio">}>;
}
