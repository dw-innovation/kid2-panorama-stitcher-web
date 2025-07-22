<script lang="ts">
	import type { MediaItem } from '$lib/shared/types';
	import { FileDown, Trash, Video } from '@lucide/svelte';
	import VideoElement from './VideoElement.svelte';
	import AddToInspectorOverlay from './AddToInspectorOverlay.svelte';
	import { appState } from '$lib/stores/state.svelte';
	import { modalState } from '$lib/stores/modals.svelte';
	import { cn, handleDownload } from '$lib/utils/lib';

	let { mediaItem }: { mediaItem: MediaItem } = $props();

	const handleRemove = async () => {
		const confirmed = await modalState.awaitResult('delete');

		if (confirmed) {
			appState.removeMediaItem(mediaItem.id);
		}
	};
</script>

<div
	class="group relative z-30 h-full flex-none {cn(
		appState.selectedMediaItem?.id === mediaItem.id &&
			'outline-2 -outline-offset-2 outline-blue-500',
		mediaItem.sourceId && 'pt-6'
	)}"
>
	<div class="absolute bottom-2 left-2 z-50 rounded-md bg-white/60 p-[2px]">
		<Video size={20} />
	</div>
	<VideoElement blobURL={mediaItem.blobURL} id={mediaItem.id} />

	<AddToInspectorOverlay {mediaItem} />

	<div
		class="absolute top-2 right-2 z-20 flex gap-1 opacity-0 transition-all group-hover:opacity-100"
	>
		<button
			onclick={() => handleDownload(mediaItem.blobURL, mediaItem.id)}
			class="mediaLibrary-button"
		>
			<FileDown size={15} />
		</button>

		{#if !appState.mediaItems.some((item) => item.sourceId === mediaItem.id)}
			<button
				onclick={handleRemove}
				class="mediaLibrary-button"
				disabled={appState.mediaItems.some((item) => item.sourceId === mediaItem.id)}
			>
				<Trash size={15} />
			</button>
		{/if}
	</div>
</div>
