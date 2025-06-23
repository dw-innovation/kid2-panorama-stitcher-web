import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cn, getMediaDimensions, handleDownload, stitchCanvasImages } from './lib';
import type { CanvasItem } from '../shared/types';

describe('cn (className utility)', () => {
	it('should merge class names correctly', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
		expect(cn('px-2 py-1', 'px-3')).toBe('py-1 px-3');
		expect(cn('bg-red-500', undefined, 'text-white')).toBe('bg-red-500 text-white');
	});

	it('should handle conditional classes', () => {
		const isVisible = true;
		const isHidden = false;
		expect(cn('base', isVisible && 'conditional', isHidden && 'hidden')).toBe('base conditional');
	});
});

describe('getMediaDimensions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should get image dimensions successfully', async () => {
		const result = await getMediaDimensions('mock-blob-url', 'image');
		expect(result).toEqual({ width: 100, height: 100 });
	});

	it('should get video dimensions successfully', async () => {
		const result = await getMediaDimensions('mock-blob-url', 'video');
		expect(result).toEqual({ width: 100, height: 100 });
	});

	it('should reject with invalid blobURL', async () => {
		await expect(getMediaDimensions('', 'image')).rejects.toThrow('Invalid blobURL provided');
		await expect(getMediaDimensions(null as unknown as string, 'image')).rejects.toThrow(
			'Invalid blobURL provided'
		);
	});

	it('should reject with invalid mediaType', async () => {
		await expect(getMediaDimensions('mock-blob-url', 'invalid' as 'image')).rejects.toThrow(
			'Unsupported media type: invalid'
		);
	});

	it('should timeout after 10 seconds', async () => {
		// Mock Image to never call onload
		const originalImage = globalThis.Image;
		globalThis.Image = class {
			onload: (() => void) | null = null;
			onerror: (() => void) | null = null;
			naturalWidth = 100;
			naturalHeight = 100;

			set src(_value: string) {
				// Don't call onload to simulate timeout
			}
		} as typeof Image;

		await expect(getMediaDimensions('mock-blob-url', 'image')).rejects.toThrow(
			'Timeout loading image dimensions'
		);

		globalThis.Image = originalImage;
	}, 11000);

	it('should handle image load error', async () => {
		const originalImage = globalThis.Image;
		globalThis.Image = class {
			onload: (() => void) | null = null;
			onerror: (() => void) | null = null;
			naturalWidth = 100;
			naturalHeight = 100;

			set src(_value: string) {
				setTimeout(() => {
					if (this.onerror) this.onerror();
				}, 0);
			}
		} as typeof Image;

		await expect(getMediaDimensions('mock-blob-url', 'image')).rejects.toThrow(
			'Failed to load image'
		);

		globalThis.Image = originalImage;
	});

	it('should handle invalid image dimensions', async () => {
		const originalImage = globalThis.Image;
		globalThis.Image = class {
			onload: (() => void) | null = null;
			onerror: (() => void) | null = null;
			naturalWidth = 0;
			naturalHeight = 0;

			set src(_value: string) {
				setTimeout(() => {
					if (this.onload) this.onload();
				}, 0);
			}
		} as typeof Image;

		await expect(getMediaDimensions('mock-blob-url', 'image')).rejects.toThrow(
			'Image loaded but has invalid dimensions'
		);

		globalThis.Image = originalImage;
	});
});

describe('handleDownload', () => {
	let mockLink: {
		href: string;
		download: string;
		click: ReturnType<typeof vi.fn>;
	};
	let mockAppendChild: ReturnType<typeof vi.fn>;
	let mockRemoveChild: ReturnType<typeof vi.fn>;
	let mockClick: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockClick = vi.fn();
		mockAppendChild = vi.fn();
		mockRemoveChild = vi.fn();

		mockLink = {
			href: '',
			download: '',
			click: mockClick
		};

		document.createElement = vi.fn().mockReturnValue(mockLink);
		document.body.appendChild = mockAppendChild;
		document.body.removeChild = mockRemoveChild;
	});

	it('should create download link and trigger download', () => {
		handleDownload('http://example.com/file.png', 'test-file.png');

		expect(document.createElement).toHaveBeenCalledWith('a');
		expect(mockLink.href).toBe('http://example.com/file.png');
		expect(mockLink.download).toBe('test-file.png');
		expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
		expect(mockClick).toHaveBeenCalled();
		expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
	});
});

describe('stitchCanvasImages', () => {
	const mockCanvasItems: CanvasItem[] = [
		{
			id: '1',
			blobURL: 'blob:mock-url-1',
			sourceId: 'source-1',
			cropBox: [0, 0, 1, 1],
			naturalHeight: 100,
			naturalWidth: 100,
			x: 0,
			y: 0,
			angle: undefined,
			scaleX: undefined,
			scaleY: undefined
		},
		{
			id: '2',
			blobURL: 'blob:mock-url-2',
			sourceId: 'source-2',
			cropBox: [0, 0, 1, 1],
			naturalHeight: 100,
			naturalWidth: 100,
			x: 10,
			y: 10,
			angle: undefined,
			scaleX: undefined,
			scaleY: undefined
		}
	];

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock fetch for individual images
		globalThis.fetch = vi.fn().mockImplementation((url: string) => {
			if (url.startsWith('blob:mock-url')) {
				return Promise.resolve({
					ok: true,
					blob: () => Promise.resolve(new Blob(['mock-image-data'], { type: 'image/png' }))
				});
			}

			// Mock API response
			if (url.includes('/stitchThumbnail')) {
				return Promise.resolve({
					ok: true,
					blob: () => Promise.resolve(new Blob(['stitched-image-data'], { type: 'image/png' }))
				});
			}

			return Promise.reject(new Error('Unknown URL'));
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should successfully stitch canvas images', async () => {
		const result = await stitchCanvasImages(mockCanvasItems);

		expect(result).toBe('mock-blob-url');
		expect(globalThis.fetch).toHaveBeenCalledTimes(3); // 2 for images + 1 for API

		// Verify API call
		const apiCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
			(call: unknown[]) => (call[0] as string).includes('/stitchThumbnail')
		);
		expect(apiCall).toBeDefined();
		expect(apiCall?.[1].method).toBe('POST');
		expect(apiCall?.[1].body).toBeInstanceOf(FormData);
	});

	it('should handle failed image fetch', async () => {
		globalThis.fetch = vi.fn().mockImplementation((url: string) => {
			if (url === 'blob:mock-url-1') {
				return Promise.resolve({ ok: false });
			}
			return Promise.resolve({
				ok: true,
				blob: () => Promise.resolve(new Blob(['mock-data']))
			});
		});

		await expect(stitchCanvasImages(mockCanvasItems)).rejects.toThrow(
			'Failed to fetch image: blob:mock-url-1'
		);
	});

	it('should handle API error response', async () => {
		globalThis.fetch = vi.fn().mockImplementation((url: string) => {
			if (url.startsWith('blob:mock-url')) {
				return Promise.resolve({
					ok: true,
					blob: () => Promise.resolve(new Blob(['mock-image-data']))
				});
			}

			if (url.includes('/stitchThumbnail')) {
				return Promise.resolve({
					ok: false,
					json: () => Promise.resolve({ message: 'Stitching failed' })
				});
			}

			return Promise.reject(new Error('Unknown URL'));
		});

		await expect(stitchCanvasImages(mockCanvasItems)).rejects.toThrow('Stitching failed');
	});

	it('should handle API error without message', async () => {
		globalThis.fetch = vi.fn().mockImplementation((url: string) => {
			if (url.startsWith('blob:mock-url')) {
				return Promise.resolve({
					ok: true,
					blob: () => Promise.resolve(new Blob(['mock-image-data']))
				});
			}

			if (url.includes('/stitchThumbnail')) {
				return Promise.resolve({
					ok: false,
					json: () => Promise.reject(new Error('Invalid JSON'))
				});
			}

			return Promise.reject(new Error('Unknown URL'));
		});

		await expect(stitchCanvasImages(mockCanvasItems)).rejects.toThrow('Failed to stitch images');
	});

	it('should handle unknown stitching error', async () => {
		globalThis.fetch = vi.fn().mockImplementation((url: string) => {
			if (url.startsWith('blob:mock-url')) {
				return Promise.resolve({
					ok: true,
					blob: () => Promise.resolve(new Blob(['mock-image-data']))
				});
			}

			if (url.includes('/stitchThumbnail')) {
				throw 'String error'; // Non-Error object
			}

			return Promise.reject(new Error('Unknown URL'));
		});

		await expect(stitchCanvasImages(mockCanvasItems)).rejects.toThrow('Unknown stitching error');
	});
});
