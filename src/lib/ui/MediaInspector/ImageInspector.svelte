<script lang="ts">
	import { appState } from '$lib/stores/state.svelte';
	import { ImagePlus, FileDown } from '@lucide/svelte';
	import Magnifier from './Magnifier.svelte';
	import { onMount } from 'svelte';
	import { handleDownload } from '$lib/utils/lib';
	import type { MediaItem } from '$lib/shared/types';

	let { mediaItem }: { mediaItem: MediaItem } = $props();

	const handleAddToCanvas = () => {
		// if images is already on the canvas or selectedMediaItem is undefined return
		if (!mediaItem || appState.canvasItems.some((item) => item.sourceId === mediaItem?.id)) return;

		const item = mediaItem;
		appState.addToCanvas(item.id, item.blobURL);
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
		<button
			onclick={handleAddToCanvas}
			disabled={!mediaItem || appState.canvasItems.some((item) => item.sourceId === mediaItem?.id)}
		>
			<ImagePlus size={12} />
			add to canvas <kbd>a</kbd>
		</button>
		<button onclick={() => mediaItem?.id && handleDownload(mediaItem.blobURL, mediaItem?.id)}>
			<FileDown size={12} />
			download
		</button>
	</div>

	<div class="relative flex h-full flex-1 items-center justify-center overflow-hidden">
		<Magnifier src={mediaItem?.blobURL} height="fit-content" alt="" className="h-[inherit]" />
	</div>
</div>
