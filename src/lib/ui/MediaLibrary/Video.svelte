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
</script>

<div class="group relative h-full flex-none">
	<VideoElement blobURL={mediaItem.blobURL} id={mediaItem.id} />
	<AddToInspectorOverlay {mediaItem} />

	<div
		class="absolute top-2 right-2 z-20 flex gap-1 opacity-0 transition-all group-hover:opacity-100"
	>
		<button onclick={() => {}} class="mediaLibrary-button">
			<FileDown size={15} />
		</button>

		<button onclick={handleRemove} class="mediaLibrary-button">
			<Trash size={15} />
		</button>
	</div>
</div>
