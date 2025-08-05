<script lang="ts">
	import { appState } from '$lib/stores/state.svelte';
	import { ImagePlus, Download } from '@lucide/svelte';
	import Magnifier from './Magnifier.svelte';
	import { onMount } from 'svelte';
	import { handleDownload } from '$lib/utils/lib';
	import type { MediaItem } from '$lib/shared/types';
	import { modalState } from '$lib/stores/modals.svelte';

	let { mediaItem }: { mediaItem: MediaItem } = $props();

	const handleAddToCanvas = () => {
		// if images is already on the canvas or selectedMediaItem is undefined return
		if (!mediaItem || appState.canvasItems.some((item) => item.sourceId === mediaItem?.id)) return;

		const item = mediaItem;
		appState.addToCanvas(item.id, item.blobURL);
	};

	const handleButtonClick = () => {
		if (!mediaItem) {
			modalState.toggle('alert', true, {
				title: 'No Image Selected',
				content: 'Please select an image from the media library first.'
			});
			return;
		}

		if (appState.canvasItems.some((item) => item.sourceId === mediaItem?.id)) {
			modalState.toggle('alert', true, {
				title: 'Image Already Added',
				content: 'This image is already on the canvas.'
			});
			return;
		}

		handleAddToCanvas();
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'a' || e.key === 'A') {
			handleAddToCanvas();
		}
	};

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);

		return () => window.removeEventListener('keydown', handleKeyDown);
	});
</script>

<div class="flex h-full flex-col gap-2">
	<div class="flex gap-2">
		<button onclick={handleButtonClick} class="button--primary">
			<ImagePlus size={12} />
			add to canvas <kbd>a</kbd>
		</button>
		<button onclick={() => mediaItem?.id && handleDownload(mediaItem.blobURL, mediaItem?.id)}>
			<Download size={12} />
			download
		</button>
	</div>

	<div class="relative flex h-full flex-1 items-center justify-center overflow-hidden">
		<Magnifier src={mediaItem?.blobURL} height="fit-content" alt="" className="h-[inherit]" />
	</div>
</div>
