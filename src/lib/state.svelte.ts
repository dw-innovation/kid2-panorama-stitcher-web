import shortUUID from 'short-uuid';
import type { AppState, MediaType } from './types';
import { getMediaDimensions } from './lib';

export const createState = () => {
	const { uuid } = shortUUID();

	const state = $state<AppState>({
		selectedMediaItem: undefined,
		mediaItems: [],
		canvasItems: [],
		panorama: undefined,
		consents: {
			processing: false,
			tracking: false
		}
	});

	return {
		get mediaItems() {
			return state.mediaItems;
		},
		addMediaItem: async (
			file: File,
			label?: string,
			sourceId?: string | undefined
		): Promise<{ id: string; blobURL: string } | undefined> => {
			let mediaType: MediaType;

			if (file.type.startsWith('image')) {
				mediaType = 'image';
			} else if (file.type.startsWith('video')) {
				mediaType = 'video';
			} else {
				return;
			}

			const id = uuid();
			const blobURL = URL.createObjectURL(file);
			const filename = file.name;

			const { width: naturalWidth, height: naturalHeight } = await getMediaDimensions(
				blobURL,
				mediaType
			);

			const newMediaItem = {
				id,
				sourceId,
				blobURL,
				filename,
				label,
				mediaType,
				naturalWidth,
				naturalHeight,
				currentTime: 0,
				speed: 1
			};

			if (sourceId) {
				const index = state.mediaItems.findIndex((item) => item.id === sourceId);
				if (index !== -1) {
					state.mediaItems.splice(index + 1, 0, newMediaItem);
				}
			} else {
				state.mediaItems.push(newMediaItem);
			}
			return { id, blobURL };
		},
		updatePlaybackTime: (id: string, time: number) => {
			const index = state.mediaItems.findIndex((item) => item.id === id);
			state.mediaItems[index].currentTime = time;
		},
		updatePlaybackSpeed: (id: string, speed: number) => {
			const index = state.mediaItems.findIndex((item) => item.id === id);
			state.mediaItems[index].speed = speed;
		},
		removeMediaItem: (id: string) => {
			const index = state.mediaItems.findIndex((item) => item.id === id);
			state.mediaItems.splice(index, 1);
		},
		selectMediaItem: (id: string) => {
			const index = state.mediaItems.findIndex((item) => item.id === id);

			if (index !== -1) state.selectedMediaItem = id;
		},
		get selectedMediaItem() {
			return state.mediaItems.find((item) => item.id === state.selectedMediaItem);
		},
		get canvasItems() {
			return state.canvasItems;
		},
		updateLabel: (id: string, newLabel: string) => {
			const index = state.mediaItems.findIndex((item) => item.id === id);
			state.mediaItems[index].label = newLabel;
		},
		updatePosition: (id: string, x: number, y: number) => {
			const index = state.canvasItems.findIndex((item) => item.id === id);

			if (index !== -1) {
				state.canvasItems[index].x = x;
				state.canvasItems[index].y = y;
			}
		},
		updateTransform: (
			id: string,
			updates: { scaleX?: number; scaleY?: number; angle?: number; x?: number; y?: number }
		) => {
			const index = state.canvasItems.findIndex((item) => item.id === id);

			if (index !== -1) {
				const item = state.canvasItems[index];
				if (updates.scaleX !== undefined) item.scaleX = updates.scaleX;
				if (updates.scaleY !== undefined) item.scaleY = updates.scaleY;
				if (updates.angle !== undefined) item.angle = updates.angle;
				if (updates.x !== undefined) item.x = updates.x;
				if (updates.y !== undefined) item.y = updates.y;
			}
		},
		async addToCanvas(sourceId: string, blobURL: string) {
			const id = uuid();

			const { width: naturalWidth, height: naturalHeight } = await getMediaDimensions(
				blobURL,
				'image'
			);

			state.canvasItems.push({
				id,
				blobURL,
				sourceId,
				cropBox: [0, 0, 1, 1],
				naturalHeight,
				naturalWidth,
				x: 0,
				y: 0,
				angle: undefined,
				scaleX: undefined,
				scaleY: undefined
			});
		},
		removeFromCanvasItems: (ids: string[]) => {
			ids.forEach((id) => {
				const index = state.canvasItems.findIndex((item) => item.id === id);
				state.canvasItems.splice(index, 1);
			});
		},
		clearCanvasItems() {
			state.canvasItems = [];
		},
		setCropBox: (id: string, cropBox: [number, number, number, number]) => {
			const frame = state.canvasItems.find((item) => item.id === id);
			if (frame) frame.cropBox = cropBox;
		},
		get panorama() {
			return state.panorama;
		},
		async setPanorama(blobURL: string) {
			const { width: naturalWidth, height: naturalHeight } = await getMediaDimensions(
				blobURL,
				'image'
			);

			state.panorama = {
				blobURL,
				naturalHeight,
				naturalWidth
			};
		},
		get consents() {
			return state.consents;
		},
		toggleConsent: (type: keyof typeof state.consents, newState?: boolean) => {
			state.consents[type] = newState !== undefined ? newState : !state.consents[type];
		}
	};
};

export const appState = createState();
