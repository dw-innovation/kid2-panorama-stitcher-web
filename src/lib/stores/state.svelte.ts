import shortUUID from 'short-uuid';
import axios from 'axios';
import { env } from '$env/dynamic/public';
import type { AppState, MatomoParams, MediaType } from '../shared/types';
import { getMediaDimensions } from '../utils/lib';

type ConsentTypes = 'processing' | 'tracking';

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

	const trackAction = async (category: string, action?: string, name?: string) => {
		if (!state.consents.tracking || !env.PUBLIC_MATOMO_URL || !env.PUBLIC_MATOMO_SITE_ID) return;
		
		try {
			const params: MatomoParams = {
				idsite: env.PUBLIC_MATOMO_SITE_ID,
				rec: 1,
				rand: Math.floor(Math.random() * 10000000),
				res: `${window?.screen?.availWidth}x${window?.screen?.availHeight}`,
				ua: window?.navigator?.userAgent,
				e_c: category
			};

			if (action) params.e_a = action;
			if (name) params.e_n = name;

			await axios({
				method: 'get',
				url: `${env.PUBLIC_MATOMO_URL}/matomo.php`,
				params,
				timeout: 5000
			});
		} catch (error) {
			console.warn('Failed to track action:', error);
		}
	};

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

	const selectMediaItem = (id: string) => {
		const index = state.mediaItems.findIndex((item) => item.id === id);

		if (index !== -1) state.selectedMediaItem = id;
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

			let naturalWidth: number, naturalHeight: number;

			try {
				const dimensions = await getMediaDimensions(blobURL, mediaType);
				naturalWidth = dimensions.width;
				naturalHeight = dimensions.height;
			} catch (error) {
				console.error(`Failed to get dimensions for ${filename}:`, error);
				URL.revokeObjectURL(blobURL);
				return;
			}

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
				selectMediaItem(newMediaItem.id);
			}
			
			trackAction('Media', 'add_media_item', `file_type_${mediaType}`);
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
				trackAction('Media', 'remove_media_item', 'media_library_remove');
			}
		},
		selectMediaItem,
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

			let naturalWidth: number, naturalHeight: number;

			try {
				const dimensions = await getMediaDimensions(blobURL, 'image');
				naturalWidth = dimensions.width;
				naturalHeight = dimensions.height;
			} catch (error) {
				console.error('Failed to get canvas item dimensions:', error);
				return;
			}

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
			
			trackAction('Canvas', 'add_to_canvas', 'media_item_added');
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
			trackAction('Canvas', 'clear_canvas', 'canvas_cleared');
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
			let naturalWidth: number, naturalHeight: number;

			try {
				const dimensions = await getMediaDimensions(blobURL, 'image');
				naturalWidth = dimensions.width;
				naturalHeight = dimensions.height;
			} catch (error) {
				console.error('Failed to get panorama dimensions:', error);
				return;
			}

			state.panorama = {
				blobURL,
				naturalHeight,
				naturalWidth
			};
		},
		get consents() {
			return state.consents;
		},
		toggle: (name: ConsentTypes, newState?: boolean) => {
			state.consents[name] = newState ? newState : !state.consents[name];
		},
		getConsent: (name: ConsentTypes) => state.consents[name],
		toggleConsent: (type: keyof typeof state.consents, newState?: boolean) => {
			state.consents[type] = newState !== undefined ? newState : !state.consents[type];
		},
		trackAction,
		pushToHistory,  
		undo
	};
};

export const appState = createState();
