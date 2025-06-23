import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createState } from './state.svelte';

// Mock the getMediaDimensions function
vi.mock('../utils/lib', () => ({
	getMediaDimensions: vi.fn().mockResolvedValue({ width: 100, height: 100 })
}));

describe('State Management', () => {
	let state: ReturnType<typeof createState>;

	beforeEach(() => {
		vi.clearAllMocks();
		state = createState();
	});

	describe('Initial State', () => {
		it('should initialize with empty state', () => {
			expect(state.mediaItems).toEqual([]);
			expect(state.canvasItems).toEqual([]);
			expect(state.selectedMediaItem).toBeUndefined();
			expect(state.panorama).toBeUndefined();
			expect(state.consents.processing).toBe(false);
			expect(state.consents.tracking).toBe(false);
		});
	});

	describe('Media Item Management', () => {
		const createMockFile = (type: string, name: string = 'test.jpg'): File => {
			return new File(['mock-content'], name, { type });
		};

		it('should add image media item successfully', async () => {
			const file = createMockFile('image/jpeg', 'test.jpg');
			const result = await state.addMediaItem(file, 'Test Image');

			expect(result).toBeDefined();
			expect(result?.id).toBeDefined();
			expect(result?.blobURL).toBe('mock-blob-url');
			expect(state.mediaItems).toHaveLength(1);

			const addedItem = state.mediaItems[0];
			expect(addedItem.filename).toBe('test.jpg');
			expect(addedItem.label).toBe('Test Image');
			expect(addedItem.mediaType).toBe('image');
			expect(addedItem.naturalWidth).toBe(100);
			expect(addedItem.naturalHeight).toBe(100);
		});

		it('should add video media item successfully', async () => {
			const file = createMockFile('video/mp4', 'test.mp4');
			const result = await state.addMediaItem(file, 'Test Video');

			expect(result).toBeDefined();
			expect(state.mediaItems).toHaveLength(1);

			const addedItem = state.mediaItems[0];
			expect(addedItem.filename).toBe('test.mp4');
			expect(addedItem.mediaType).toBe('video');
		});

		it('should reject unsupported file types', async () => {
			const file = createMockFile('application/pdf', 'test.pdf');
			const result = await state.addMediaItem(file);

			expect(result).toBeUndefined();
			expect(state.mediaItems).toHaveLength(0);
		});

		it('should handle dimension fetch failure', async () => {
			const { getMediaDimensions } = await import('../utils/lib');
			vi.mocked(getMediaDimensions).mockRejectedValueOnce(new Error('Failed to get dimensions'));

			const file = createMockFile('image/jpeg');
			const result = await state.addMediaItem(file);

			expect(result).toBeUndefined();
			expect(state.mediaItems).toHaveLength(0);
		});

		it('should normalize MIME types for Safari compatibility', async () => {
			// Test image/jpg -> image/jpeg normalization
			const jpgFile = createMockFile('image/jpg', 'test.jpg');
			await state.addMediaItem(jpgFile);

			// Test video/quicktime -> video/mp4 normalization  
			const movFile = createMockFile('video/quicktime', 'test.mov');
			await state.addMediaItem(movFile);

			// Test video/x-msvideo -> video/mp4 normalization
			const aviFile = createMockFile('video/x-msvideo', 'test.avi');
			await state.addMediaItem(aviFile);

			expect(state.mediaItems).toHaveLength(3);
			
			// Verify the blob URLs were created (indicating successful processing)
			expect(state.mediaItems[0].blobURL).toBe('mock-blob-url');
			expect(state.mediaItems[1].blobURL).toBe('mock-blob-url');
			expect(state.mediaItems[2].blobURL).toBe('mock-blob-url');

			// Verify media types are correctly assigned
			expect(state.mediaItems[0].mediaType).toBe('image');
			expect(state.mediaItems[1].mediaType).toBe('video');
			expect(state.mediaItems[2].mediaType).toBe('video');
		});

		it('should select media item after adding', async () => {
			const file = createMockFile('image/jpeg');
			await state.addMediaItem(file);

			expect(state.selectedMediaItem).toBeDefined();
			expect(state.selectedMediaItem?.id).toBe(state.mediaItems[0].id);
		});

		it('should insert media item after source item', async () => {
			const file1 = createMockFile('image/jpeg', 'first.jpg');
			const file2 = createMockFile('image/jpeg', 'second.jpg');
			const file3 = createMockFile('image/jpeg', 'third.jpg');

			await state.addMediaItem(file1);
			await state.addMediaItem(file2);

			const sourceId = state.mediaItems[0].id;
			await state.addMediaItem(file3, 'Third Image', sourceId);

			expect(state.mediaItems).toHaveLength(3);
			expect(state.mediaItems[1].filename).toBe('third.jpg');
			expect(state.mediaItems[1].sourceId).toBe(sourceId);
		});
	});

	describe('Media Item Operations', () => {
		beforeEach(async () => {
			const file1 = createMockFile('image/jpeg', 'test1.jpg');
			const file2 = createMockFile('image/jpeg', 'test2.jpg');
			await state.addMediaItem(file1, 'Image 1');
			await state.addMediaItem(file2, 'Image 2');
		});

		const createMockFile = (type: string, name: string): File => {
			return new File(['mock-content'], name, { type });
		};

		it('should select media item by id', () => {
			const itemId = state.mediaItems[1].id;
			state.selectMediaItem(itemId);

			expect(state.selectedMediaItem?.id).toBe(itemId);
		});

		it('should update media item label', () => {
			const itemId = state.mediaItems[0].id;
			state.updateLabel(itemId, 'Updated Label');

			expect(state.mediaItems[0].label).toBe('Updated Label');
		});

		it('should update playback time', () => {
			const itemId = state.mediaItems[0].id;
			state.updatePlaybackTime(itemId, 5.5);

			expect(state.mediaItems[0].currentTime).toBe(5.5);
		});

		it('should update playback speed', () => {
			const itemId = state.mediaItems[0].id;
			state.updatePlaybackSpeed(itemId, 1.5);

			expect(state.mediaItems[0].speed).toBe(1.5);
		});

		it('should remove media item', () => {
			const itemId = state.mediaItems[0].id;
			state.removeMediaItem(itemId);

			expect(state.mediaItems).toHaveLength(1);
			expect(state.mediaItems[0].filename).toBe('test2.jpg');
		});

		it('should not remove media item with dependents', async () => {
			const sourceId = state.mediaItems[0].id;
			const file = createMockFile('image/jpeg', 'dependent.jpg');
			await state.addMediaItem(file, 'Dependent', sourceId);

			state.removeMediaItem(sourceId);

			expect(state.mediaItems).toHaveLength(3); // No removal occurred
		});
	});

	describe('Canvas Item Management', () => {
		beforeEach(async () => {
			const file = createMockFile('image/jpeg', 'canvas-test.jpg');
			await state.addMediaItem(file);
		});

		const createMockFile = (type: string, name: string): File => {
			return new File(['mock-content'], name, { type });
		};

		it('should add item to canvas', async () => {
			const sourceId = state.mediaItems[0].id;
			const blobURL = state.mediaItems[0].blobURL;

			await state.addToCanvas(sourceId, blobURL);

			expect(state.canvasItems).toHaveLength(1);

			const canvasItem = state.canvasItems[0];
			expect(canvasItem.sourceId).toBe(sourceId);
			expect(canvasItem.blobURL).toBe(blobURL);
			expect(canvasItem.naturalWidth).toBe(100);
			expect(canvasItem.naturalHeight).toBe(100);
			expect(canvasItem.cropBox).toEqual([0, 0, 1, 1]);
		});

		it('should not add duplicate canvas items', async () => {
			const sourceId = state.mediaItems[0].id;
			const blobURL = state.mediaItems[0].blobURL;

			await state.addToCanvas(sourceId, blobURL);
			await state.addToCanvas(sourceId, blobURL);

			expect(state.canvasItems).toHaveLength(1);
		});

		it('should position items with offset', async () => {
			const file2 = createMockFile('image/jpeg', 'second.jpg');
			await state.addMediaItem(file2);

			await state.addToCanvas(state.mediaItems[0].id, state.mediaItems[0].blobURL);
			await state.addToCanvas(state.mediaItems[1].id, state.mediaItems[1].blobURL);

			expect(state.canvasItems[0].x).toBe(0);
			expect(state.canvasItems[0].y).toBe(0);
			expect(state.canvasItems[1].x).toBe(20);
			expect(state.canvasItems[1].y).toBe(20);
		});

		it('should update canvas item position', async () => {
			const sourceId = state.mediaItems[0].id;
			await state.addToCanvas(sourceId, state.mediaItems[0].blobURL);

			const canvasItemId = state.canvasItems[0].id;
			state.updatePosition(canvasItemId, 50, 75);

			expect(state.canvasItems[0].x).toBe(50);
			expect(state.canvasItems[0].y).toBe(75);
		});

		it('should update canvas item transform', async () => {
			const sourceId = state.mediaItems[0].id;
			await state.addToCanvas(sourceId, state.mediaItems[0].blobURL);

			const canvasItemId = state.canvasItems[0].id;
			state.updateTransform(canvasItemId, {
				scaleX: 1.5,
				scaleY: 0.8,
				angle: 45,
				x: 100,
				y: 200
			});

			const item = state.canvasItems[0];
			expect(item.scaleX).toBe(1.5);
			expect(item.scaleY).toBe(0.8);
			expect(item.angle).toBe(45);
			expect(item.x).toBe(100);
			expect(item.y).toBe(200);
		});

		it('should set crop box', async () => {
			const sourceId = state.mediaItems[0].id;
			await state.addToCanvas(sourceId, state.mediaItems[0].blobURL);

			const canvasItemId = state.canvasItems[0].id;
			state.setCropBox(canvasItemId, [0.1, 0.2, 0.8, 0.9]);

			expect(state.canvasItems[0].cropBox).toEqual([0.1, 0.2, 0.8, 0.9]);
		});

		it('should remove canvas items', async () => {
			await state.addToCanvas(state.mediaItems[0].id, state.mediaItems[0].blobURL);

			const canvasItemId = state.canvasItems[0].id;
			state.removeFromCanvasItems([canvasItemId]);

			expect(state.canvasItems).toHaveLength(0);
		});

		it('should clear all canvas items', async () => {
			await state.addToCanvas(state.mediaItems[0].id, state.mediaItems[0].blobURL);

			state.clearCanvasItems();

			expect(state.canvasItems).toHaveLength(0);
		});
	});

	describe('Panorama Management', () => {
		it('should set panorama', async () => {
			await state.setPanorama('mock-panorama-url');

			expect(state.panorama).toBeDefined();
			expect(state.panorama?.blobURL).toBe('mock-panorama-url');
			expect(state.panorama?.naturalWidth).toBe(100);
			expect(state.panorama?.naturalHeight).toBe(100);
		});

		it('should handle panorama dimension failure', async () => {
			const { getMediaDimensions } = await import('../utils/lib');
			vi.mocked(getMediaDimensions).mockRejectedValueOnce(new Error('Failed'));

			await state.setPanorama('mock-panorama-url');

			expect(state.panorama).toBeUndefined();
		});
	});

	describe('Consent Management', () => {
		it('should toggle consent states', () => {
			state.toggleConsent('processing');
			expect(state.consents.processing).toBe(true);

			state.toggleConsent('processing');
			expect(state.consents.processing).toBe(false);
		});

		it('should set specific consent state', () => {
			state.toggleConsent('tracking', true);
			expect(state.consents.tracking).toBe(true);

			state.toggleConsent('tracking', false);
			expect(state.consents.tracking).toBe(false);
		});
	});

	describe('History Management', () => {
		beforeEach(async () => {
			const file = createMockFile('image/jpeg', 'history-test.jpg');
			await state.addMediaItem(file, 'Initial');
		});

		const createMockFile = (type: string, name: string): File => {
			return new File(['mock-content'], name, { type });
		};

		it('should track history on state changes', async () => {
			const initialCount = state.mediaItems.length;

			// Add another item (this should push to history)
			const file = createMockFile('image/jpeg', 'second.jpg');
			await state.addMediaItem(file, 'Second');

			expect(state.mediaItems).toHaveLength(initialCount + 1);
		});

		it('should undo last change', async () => {
			const originalLabel = state.mediaItems[0].label;
			const itemId = state.mediaItems[0].id;

			// Make a change
			state.updateLabel(itemId, 'Changed Label');
			expect(state.mediaItems[0].label).toBe('Changed Label');

			// Undo
			state.undo();
			expect(state.mediaItems[0].label).toBe(originalLabel);
		});

		it('should handle undo with empty history', () => {
			// Clear any existing history by creating fresh state
			const freshState = createState();

			// Try to undo on empty history - should not throw
			expect(() => freshState.undo()).not.toThrow();
		});

		it('should preserve history stack structure', async () => {
			// Make multiple changes
			const itemId = state.mediaItems[0].id;
			state.updateLabel(itemId, 'Change 1');
			state.updateLabel(itemId, 'Change 2');

			// Undo once
			state.undo();
			expect(state.mediaItems[0].label).toBe('Change 1');

			// Undo again
			state.undo();
			expect(state.mediaItems[0].label).toBe('Initial');
		});
	});
});
