import type { FabricObject } from 'fabric';

export type MediaType = 'video' | 'image';

export type MediaItem = {
	id: string;
	filename: string;
	blobURL: string;
	sourceId: string | undefined;
	label: string | undefined;
	mediaType: MediaType;
	naturalHeight: number;
	naturalWidth: number;
};
export interface CanvasObject extends FabricObject {
	_id: string;
}

export type CanvasItem = {
	id: string;
	blobURL: string;
	sourceId: string;
	x: number;
	y: number;
	scaleX: number | undefined;
	scaleY: number | undefined;
	angle: number | undefined;
	naturalHeight: number;
	naturalWidth: number;
	cropBox: [number, number, number, number];
};

export type AppState = {
	selectedMediaItem: string | undefined;
	mediaItems: MediaItem[];
	canvasItems: CanvasItem[];
};
