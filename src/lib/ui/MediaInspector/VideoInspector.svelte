<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { ImagePlus, FileDown, Expand } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import VideoPlayer from './VideoPlayer.svelte';
	import { handleDownload } from '$lib/lib';
	import Modal from '../Modal.svelte';
	import type { MediaItem } from '$src/lib/types';

	let videoElement: HTMLVideoElement;

	let { mediaItem }: { mediaItem: MediaItem } = $props();

	const handleCaptureFrame = async (videoElement: HTMLVideoElement, mediaItem: MediaItem) => {
		if (!videoElement || !mediaItem) return;

		const selectedItem = mediaItem;
		const { videoWidth: width, videoHeight: height } = videoElement;

		const canvas = Object.assign(document.createElement('canvas'), { width, height });
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.drawImage(videoElement, 0, 0, width, height);

		canvas.toBlob(async (blob) => {
			if (!blob) return;

			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
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
		videoElement: HTMLVideoElement,
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

	let modal: Modal;
</script>

<Modal bind:this={modal}>full size selector (yet to come)</Modal>

<div class="mediaInspector relative h-full max-h-full flex-none">
	<span class="pane-label">
		<span>video inspector</span>

		<button class="button--ghost" onclick={() => modal.toggle(true)}><Expand size={12} /></button>
	</span>

	<div class="flex h-full flex-col">
		<div class="flex gap-2">
			<button onclick={() => handleCaptureFrame(videoElement, mediaItem)} disabled={!mediaItem}>
				<ImagePlus size={12} />
				capture frame <kbd>c</kbd>
			</button>
			<button onclick={() => mediaItem?.id && handleDownload(mediaItem.blobURL, mediaItem?.id)}>
				<FileDown size={12} />
				download
			</button>
		</div>

		<div class="relative flex h-full flex-1 items-center justify-center overflow-hidden">
			{#if mediaItem}
				<VideoPlayer {mediaItem} bind:videoElement />
			{/if}
		</div>
	</div>
</div>
