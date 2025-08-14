import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import type { CanvasItem, MediaType } from '../shared/types';
import { PUBLIC_STITCH_API } from '$env/static/public';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getMediaDimensions = (
	blobURL: string,
	mediaType: MediaType
): Promise<{ width: number; height: number }> =>
	new Promise((resolve, reject) => {
		// Validate inputs
		if (!blobURL || typeof blobURL !== 'string') {
			reject(new Error('Invalid blobURL provided'));
			return;
		}

		if (!mediaType || (mediaType !== 'image' && mediaType !== 'video')) {
			reject(new Error(`Unsupported media type: ${mediaType}`));
			return;
		}

		// Set timeout to prevent hanging
		const timeout = setTimeout(() => {
			reject(new Error(`Timeout loading ${mediaType} dimensions`));
		}, 10000); // 10 second timeout

		const clearTimeoutAndResolve = (dimensions: { width: number; height: number }) => {
			clearTimeout(timeout);
			resolve(dimensions);
		};

		const clearTimeoutAndReject = (error: string) => {
			clearTimeout(timeout);
			reject(new Error(error));
		};

		if (mediaType === 'image') {
			const img = new Image();

			img.onload = () => {
				if (img.naturalWidth === 0 || img.naturalHeight === 0) {
					clearTimeoutAndReject('Image loaded but has invalid dimensions');
					return;
				}
				clearTimeoutAndResolve({
					width: img.naturalWidth,
					height: img.naturalHeight
				});
			};

			img.onerror = () => {
				clearTimeoutAndReject('Failed to load image');
			};

			img.src = blobURL;
		} else if (mediaType === 'video') {
			const video = document.createElement('video');

			video.onloadedmetadata = () => {
				if (video.videoWidth === 0 || video.videoHeight === 0) {
					clearTimeoutAndReject('Video loaded but has invalid dimensions');
					return;
				}
				clearTimeoutAndResolve({
					width: video.videoWidth,
					height: video.videoHeight
				});
			};

			video.onerror = () => {
				clearTimeoutAndReject('Failed to load video metadata');
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

export const stitchCanvasImages = async (canvasItems: CanvasItem[], trackAction?: (category: string, action?: string, name?: string) => void): Promise<string> => {
	trackAction?.('Processing', 'stitch_start', `image_count_${canvasItems.length}`);
	
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
		trackAction?.('Processing', 'stitch_error', err instanceof Error ? err.message : 'unknown_error');
		throw err instanceof Error ? err : new Error('Unknown stitching error');
	}
};
