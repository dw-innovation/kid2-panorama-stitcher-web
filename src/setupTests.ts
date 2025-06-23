import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock URL.createObjectURL and URL.revokeObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
globalThis.URL.revokeObjectURL = vi.fn();

// Mock Image constructor
globalThis.Image = class {
	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;
	naturalWidth = 100;
	naturalHeight = 100;

	set src(_value: string) {
		setTimeout(() => {
			if (this.onload) this.onload();
		}, 0);
	}
} as typeof Image;

// Mock HTMLVideoElement
globalThis.HTMLVideoElement = class {
	onloadedmetadata: (() => void) | null = null;
	onerror: (() => void) | null = null;
	videoWidth = 100;
	videoHeight = 100;

	set src(_value: string) {
		setTimeout(() => {
			if (this.onloadedmetadata) this.onloadedmetadata();
		}, 0);
	}
} as typeof HTMLVideoElement;

// Mock document.createElement for video
const originalCreateElement = document.createElement;
document.createElement = function (tagName: string) {
	if (tagName === 'video') {
		return new globalThis.HTMLVideoElement() as HTMLVideoElement;
	}
	return originalCreateElement.call(this, tagName);
};
