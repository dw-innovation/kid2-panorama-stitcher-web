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
	currentTime: number;
	speed: number;
	timestamp?: number;
};

export type Panorama = {
	blobURL: string;
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
	panorama: Panorama | undefined;
	consents: Record<ConsentTypes, boolean>;
	historyStack: Omit<AppState, 'historyStack'>[];
};

export type ConsentTypes = 'processing' | 'tracking';

export type MatomoParams = {
	idsite: string | undefined;
	rec: number;
	rand: number;
	res: string;
	ua: string;
	e_c: string;
	e_a?: string;
	e_n?: string;
};
