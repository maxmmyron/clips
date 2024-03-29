declare interface Window {
  media: {
    unresolved: {uuid:string, media:Promise<App.Media>}[],
    resolved: App.Media[]
  }
  timeline: App.Timeline;
  current: { video: (string | null)[]; audio: (string | null)[]; }
}
