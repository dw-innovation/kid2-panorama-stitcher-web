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
		},
		historyStack: []
	});

	const pushToHistory = () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { historyStack, ...partial } = $state.snapshot(state) as AppState;
		state.historyStack.push(partial);
	};

	const undo = () => {
		const prev = state.historyStack.pop();
		if (!prev) return;

		state.mediaItems = prev.mediaItems;
		state.panorama = prev.panorama;
		state.consents = prev.consents;
		state.canvasItems = [];
		queueMicrotask(() => (state.canvasItems = prev.canvasItems));
	};

	return {
		get mediaItems() {
			return state.mediaItems;
		},
		async addMediaItem(
			file: File,
			label?: string,
			sourceId?: string | undefined,
			timestamp?: number
		): Promise<{ id: string; blobURL: string } | undefined> {
			pushToHistory();

			let mediaType: MediaType;

			const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

			const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

			if (allowedImageTypes.includes(file.type)) {
				mediaType = 'image';
			} else if (allowedVideoTypes.includes(file.type)) {
				mediaType = 'video';
			} else {
				console.warn(`Unsupported file type: ${file.type} for file: ${file.name}`);
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
				speed: 1,
				timestamp
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
			if (index !== -1) {
				state.mediaItems[index].currentTime = time;
			}
		},
		updatePlaybackSpeed: (id: string, speed: number) => {
			const index = state.mediaItems.findIndex((item) => item.id === id);
			if (index !== -1) {
				state.mediaItems[index].speed = speed;
			}
		},
		removeMediaItem(id: string) {
			pushToHistory();

			if (state.mediaItems.some((item) => item.sourceId === id)) return;

			const index = state.mediaItems.findIndex((item) => item.id === id);
			if (index !== -1) {
				state.mediaItems.splice(index, 1);
			}
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
		updateLabel(id: string, newLabel: string) {
			pushToHistory();

			const index = state.mediaItems.findIndex((item) => item.id === id);
			if (index !== -1) {
				state.mediaItems[index].label = newLabel;
			}
		},
		updatePosition(id: string, x: number, y: number) {
			pushToHistory();

			const index = state.canvasItems.findIndex((item) => item.id === id);

			if (index !== -1) {
				state.canvasItems[index].x = x;
				state.canvasItems[index].y = y;
			}
		},
		updateTransform(
			id: string,
			updates: { scaleX?: number; scaleY?: number; angle?: number; x?: number; y?: number }
		) {
			pushToHistory();

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
			if (state.canvasItems.some((item) => item.sourceId === sourceId)) return;

			pushToHistory();

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
				x: state.canvasItems.length * 20,
				y: state.canvasItems.length * 20,
				angle: undefined,
				scaleX: undefined,
				scaleY: undefined
			});
		},
		removeFromCanvasItems(ids: string[]) {
			pushToHistory();

			ids.forEach((id) => {
				const index = state.canvasItems.findIndex((item) => item.id === id);
				if (index !== -1) {
					state.canvasItems.splice(index, 1);
				}
			});
		},
		clearCanvasItems() {
			pushToHistory();

			state.canvasItems = [];
		},
		setCropBox(id: string, cropBox: [number, number, number, number]) {
			pushToHistory();

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
		},
		pushToHistory,
		undo
	};
};

export const appState = createState();
