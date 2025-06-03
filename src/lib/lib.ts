import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import type { CanvasItem, MediaType } from './types';
import { appState } from './state.svelte';
import { PUBLIC_STITCH_API } from '$env/static/public';
import { stepsStore } from './steps.svelte';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getMediaDimensions = (
	blobURL: string,
	mediaType: MediaType
): Promise<{ width: number; height: number }> =>
	new Promise((resolve) => {
		if (mediaType === 'image') {
			const img = new Image();
			img.onload = () => {
				resolve({ width: img.naturalWidth, height: img.naturalHeight });
			};
			img.src = blobURL;
		} else if (mediaType === 'video') {
			const video = document.createElement('video');
			video.onloadedmetadata = () => {
				resolve({ width: video.videoWidth, height: video.videoHeight });
			};
			video.src = blobURL;
		}
	});

export const handleDownload = (id: string) => {
	const mediaItem = appState.mediaItems.find((item) => item.id === id);
	if (!mediaItem) return;

	const link = document.createElement('a');
	link.href = mediaItem.blobURL;
	link.download = mediaItem.id;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

export const stitchCanvasImages = async (canvasItems: CanvasItem[]) => {
	const formData = new FormData();

	for (const item of canvasItems) {
		const response = await fetch(item.blobURL);
		const blob = await response.blob();

		const file = new File([blob], `${item.sourceId || item.id}.png`, { type: blob.type });

		formData.append('images', file);
	}

	try {
		const response = await fetch(`${PUBLIC_STITCH_API}/stitchPanorama`, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const error = await response.json();
			console.error('Stitching error:', error);
			return;
		}

		const stitchedBlob = await response.blob();
		const stitchedURL = URL.createObjectURL(stitchedBlob);

		appState.setPanorama(stitchedURL);
		stepsStore.nextStep();
	} catch (err) {
		console.error('Failed to send images:', err);
	}
};
