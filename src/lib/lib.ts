import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import type { CanvasItem, MediaType } from './types';
import { appState } from './state.svelte';
import { PUBLIC_STITCH_API } from '$env/static/public';

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

export const handleDownload = (url: string, name: string) => {
	const link = document.createElement('a');
	link.href = url;
	link.download = name;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

export const stitchCanvasImages = async (canvasItems: CanvasItem[]): Promise<string> => {
	const formData = new FormData();

	for (const item of canvasItems) {
		const response = await fetch(item.blobURL);
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${item.blobURL}`);
		}
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
			let message = 'Failed to stitch images';
			try {
				const error = await response.json();
				message = error?.message || message;
			} catch {
				// keep default message
			}
			throw new Error(message);
		}

		const stitchedBlob = await response.blob();
		return URL.createObjectURL(stitchedBlob);
	} catch (err) {
		console.error('Stitching failed:', err);
		throw err instanceof Error ? err : new Error('Unknown stitching error');
	}
};
