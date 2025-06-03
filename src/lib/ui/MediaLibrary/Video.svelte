<script lang="ts">
	import type { MediaItem } from '$lib/types';
	import { FileDown, Trash } from '@lucide/svelte';
	import VideoElement from './VideoElement.svelte';
	import AddToInspectorOverlay from './AddToInspectorOverlay.svelte';
	import { appState } from '$lib/state.svelte';

	let { mediaItem }: { mediaItem: MediaItem } = $props();

	const handleRemove = () => {
		appState.removeMediaItem(mediaItem.id);
	};

	const handleDownload = () => {
		if (!appState.selectedMediaItem?.blobURL) return;

		const link = document.createElement('a');
		link.href = appState.selectedMediaItem.blobURL;
		link.download = appState.selectedMediaItem.id;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};
</script>

<div class="group relative h-full flex-none">
	<VideoElement blobURL={mediaItem.blobURL} id={mediaItem.id} />
	<AddToInspectorOverlay {mediaItem} />

	<div
		class="absolute top-2 right-2 z-20 flex gap-1 opacity-0 transition-all group-hover:opacity-100"
	>
		<button onclick={handleDownload} class="mediaLibrary-button">
			<FileDown size={15} />
		</button>

		<button onclick={handleRemove} class="mediaLibrary-button">
			<Trash size={15} />
		</button>
	</div>
</div>
