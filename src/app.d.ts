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

		type Node = VideoNode | AudioNode | ImageNode;
		type NodeTypes = "video" | "audio" | "image";
		type NodeObjects<T> = T extends "video" ? VideoNode : T extends "audio" ? AudioNode : T extends "image" ? ImageNode : never;

		interface VideoNode {
			next: Node | null;
			prev: Node | null;
			uuid: string;
			mediaUUID: string;
			type: "video";
			src: string;
			metadata: {
				title: string;
				duration: number;
				start: number;
				end: number;
			}
		}

		interface AudioNode {
			next: Node | null;
			prev: Node | null;
			uuid: string;
			mediaUUID: string;
			type: "audio";
			src: string;
			metadata: {
				title: string;
				duration: number;
				start: number;
				end: number;
			}
		}

		interface ImageNode {
			next: Node | null;
			prev: Node | null;
			uuid: string;
			mediaUUID: string;
			type: "image";
			src: string;
			metadata: {
				title: string;
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

		namespace stores {
			type WritableStudio = Writable<{
				resize: "row" | "media_col" | "timeline_col" | null;
				exportName: string;
				audioContext: AudioContext | null;
				mouse: {x: number, y: number};
				keys: Set<string>;
				draggable: {
					// Resolves to the UUID of a Media object.
					mediaUUID: string | null;
					origin: {
						pos: {x: number, y: number};
						region: "timeline" | "media_pool";
					} | null;
					event: "start" | "drag" | "end" | null;
					current: {
						region: "timeline" | "media_pool" | "player" | null;
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
				runtime: number;
				duration: number;
				selected: string[];
				timeline: Timeline;
				current: Node | null;
				sources: Map<string, {
					source: HTMLVideoElement | HTMLImageElement;
					type: "video" | "image";
				}>;
				zoomScale: number;
				dragIndex: number;
				currentNodeRuntime: number;
			}>;

			type WritablePlayer = Writable<{
				source: string | null;
				isSinglePreview: boolean;
				isPaused: boolean;
				lastPauseState: boolean;
			}>;
		}
	}
}

export {};
