<script lang="ts">
	import { handleDownload } from '$lib/lib';

	import { appState } from '$src/lib/state.svelte';
	import { FileDown, ImagePlus } from '@lucide/svelte';
	import VideoPlayer from './VideoPlayer.svelte';
	import type { MediaItem } from '$src/lib/types';
	import { onMount } from 'svelte';

	let { mediaItem }: { mediaItem: MediaItem } = $props();

	let videoElement: HTMLVideoElement | undefined = $state();

	const handleCaptureFrame = async (videoElement: HTMLVideoElement | undefined, mediaItem: MediaItem) => {
		if (!videoElement || !mediaItem) return;

		const selectedItem = mediaItem;
		const { videoWidth: width, videoHeight: height } = videoElement;

		const canvas = Object.assign(document.createElement('canvas'), { width, height });
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.drawImage(videoElement, 0, 0, width, height);

		canvas.toBlob(async (blob) => {
			if (!blob) return;

			const timestamp = videoElement.currentTime;

			const filename = `frame-${timestamp}.png`;
			const file = new File([blob], filename, { type: 'image/png' });
			const newItem = await appState.addMediaItem(
				file,
				`Frame @ ${timestamp}`,
				selectedItem.id,
				timestamp
			);

			if (newItem) {
				appState.addToCanvas(newItem.id, newItem.blobURL);
			}
		}, 'image/png');
	};

	const handleKeyDown = (
		e: KeyboardEvent,
		videoElement: HTMLVideoElement | undefined,
		mediaItem: MediaItem
	) => {
		if (e.key === 'c' || e.key === 'C') {
			handleCaptureFrame(videoElement, mediaItem);
		}
	};

	onMount(() => {
		window.addEventListener('keydown', (e) => handleKeyDown(e, videoElement, mediaItem));
		return () => {
			window.removeEventListener('keydown', (e) => handleKeyDown(e, videoElement, mediaItem));
		};
	});
</script>

<div class="relative flex h-full flex-col">
	<div class="flex gap-2">
		<button onclick={() => handleCaptureFrame(videoElement, mediaItem)} disabled={!mediaItem || !videoElement}>
			<ImagePlus size={12} />
			capture frame <kbd>c</kbd>
		</button>
		<button onclick={() => mediaItem?.id && handleDownload(mediaItem.blobURL, mediaItem?.id)}>
			<FileDown size={12} />
			download
		</button>
	</div>

	<div class="relative flex h-full min-h-0 flex-1 items-center justify-center overflow-hidden">
		{#if mediaItem}
			<VideoPlayer {mediaItem} bind:videoElement />
		{/if}
	</div>
</div>
