import { type Writable } from "svelte/store";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		enum Location { PLAYER = 0, TIMELINE = 1 };

		interface Timeline {
			head: Node | null;
			tail: Node | null;

			add(node: Node, index?: number): void;
			remove(uuid: string): Node | null;
			indexOf(uuid: string): number;

			getByUUID(uuid: string): Node | null;
			getByIndex(index: number): Node | null;

			toArray(): Node[];
			get length(): number;
		}

		interface Node<T = "video" | "audio" | "image"> {
			next: Node | null;
			prev: Node | null;
			uuid: string;
			type: T;
			src: string;
			metadata: {
				title: string;
				duration: number;
				start: number;
				end: number;
			}
		};

		type Media<T = "video" | "audio" | "image"> = {
			uuid: string;
			type: T extends "video" ? "video" : T extends "audio" ? "audio" : "image";
			src: string;
			metadata: {
				title: string;
			} & (T extends "video" ? {
				thumbnails: string[];
				duration: number;
				audio: AudioBuffer;
			} : T extends "audio" ? {
				duration: number;
				audio: AudioBuffer;
			} : {});
		}

		namespace stores {
			type WritableStudio = Writable<{
				resize: "row" | "media_col" | "timeline_col" | null;
				audioContext: AudioContext | null;
				mouse: {x: number, y: number};
				draggable: {
					media: Media | null;
					origin: {
						pos: {x: number, y: number};
						region: "timeline" | "media_pool";
					} | null;
					event: "start" | "drag" | "end" | null;
					current: {
						region: "timeline" | "media_pool" | null;
					};
					ghost: {
						pos: Spring<{x: number, y: number}>;
						size: Spring<{width: number, height: number}>;
					};
				};
			}>;

			type WritableMediaPool = Writable<{
				selected: string[];
				media: Media[];
			}>;

			type WritableTimeline = Writable<{
				selected: string[];
				timeline: Timeline;
				current: Node | null;
				sources: Map<string, {
					video: HTMLVideoElement;
					type: "video";
				} | {
					image: HTMLImageElement;
					type: "image";
				}>;
				zoomScale: number;
			}>;

			type WritablePlayer = Writable<{
				source: string | null;
				isSinglePreview: boolean;
				isPaused: boolean;
			}>;
		}
	}
}

declare interface Window {
	mediaPool: App.Media[];
	timeline: App.Timeline;
}

export {};
