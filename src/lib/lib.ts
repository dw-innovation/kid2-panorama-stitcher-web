import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import type { MediaType } from './types';

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
