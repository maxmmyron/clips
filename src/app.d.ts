import { type Writable } from "svelte/store";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		enum Location { PLAYER = 0, TIMELINE = 1 };

		type Clip = VideoClip | AudioClip | ImageClip;
		type ClipTypes = "video" | "audio" | "image";
		type ClipObjects<T> = T extends "video" ? VideoClip : T extends "audio" ? AudioClip : T extends "image" ? ImageClip : never;

		interface VideoClip {
			uuid: string;
			mediaUUID: string;
			type: "video";
			src: string;
			metadata: {
				title: string;
				timelineStart: number;
				duration: number;
				start: number;
				end: number;
			}
		}

		interface AudioClip {
			uuid: string;
			mediaUUID: string;
			type: "audio";
			src: string;
			metadata: {
				title: string;
				timelineStart: number;
				duration: number;
				start: number
				end: number;
			}
		}

		interface ImageClip {
			uuid: string;
			mediaUUID: string;
			type: "image";
			src: string;
			metadata: {
				title: string;
				timelineStart: number;
				duration: number;
				start: number;
				end: number;
			}
		}

		type Media = Video | Audio | Image;
		type MediaTypes = "video" | "audio" | "image";
		type MediaObjects<T> = T extends "video" ? Video : T extends "audio" ? Audio : T extends "image" ? Image : never;


		interface Video {
			uuid: string;
			src: string;
			type: "video";
			metadata: {
				title: string;
				thumbnails: string[];
				duration: number;
				audio: AudioBuffer;
			}
		}

		interface Audio {
			uuid: string;
			src: string;
			type: "audio";
			metadata: {
				title: string;
				duration: number;
				audio: AudioBuffer;
			}
		}

		interface Image {
			uuid: string;
			src: string;
			type: "image";
			metadata: {
				title: string;
			}
		}

		type Toast = {
			uuid: string;
			message: string;
			level: "info" | "warning" | "error";
			timeoutID: number;
		}

		namespace stores {
			type audioContext = Writable<AudioContext>;

			type media = Writable<{
				unresolved: Array<{uuid: string, name: string, media: Promise<App.Media>}>;
				resolved: App.Media[];
			}>

			type draggable = Writable<{
				media: App.Media | null;
				event: "start" | "drag" | null;
				origin: {
					pos: {x: number, y: number};
					region: "timeline" | "media_pool";
				} | null;
				region: "timeline" | "media_pool" | null;
				ghost: {
					pos: Spring<{x: number, y: number}>;
					size: Spring<{width: number, height: number}>;
				}
			}>;

			type timeline = Writable<{
				clips: {
					video: Array<App.VideoClip | App.ImageClip>;
					audio: App.AudioClip[];
				};
				current: App.Clip | null;
				clipRuntime: number;
				duration: number;
				runtime: number;
				zoomScale: number;
			}>;

			type player = Writable<{
				source: string | null;
				isPaused: boolean;
			}>;
		}
	}
}

export {};
