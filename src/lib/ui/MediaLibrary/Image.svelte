<script lang="ts">
	import type { MediaItem } from '$lib/types';
	import { Blocks, Trash } from '@lucide/svelte';
	import ImageElement from './ImageElement.svelte';
	import AddToInspectorOverlay from './AddToInspectorOverlay.svelte';
	import { appState } from '$lib/state.svelte';

	let { mediaItem }: { mediaItem: MediaItem } = $props();

	const handleRemove = () => {
		appState.removeMediaItem(mediaItem.id);
	};
</script>

<div class:pt-6={mediaItem.sourceId} class="relative">
	{#if mediaItem.sourceId}
		<div
			class="absolute top-4 -left-2 h-2 -translate-x-1/2 border-t-2 border-r-2 border-[#5b5b5b]"
			style:width="calc(100% + 1rem)"
		></div>
	{/if}
	<div class="group relative z-20 h-full flex-none" style:width="max-content">
		<ImageElement blobURL={mediaItem.blobURL} id={mediaItem.id} />

		<AddToInspectorOverlay {mediaItem} />

		<div
			class="absolute top-2 right-2 z-20 flex gap-1 opacity-0 transition-all group-hover:opacity-100"
		>
			<button
				onclick={() => appState.addToCanvas(mediaItem.id, mediaItem.blobURL)}
				class="mediaLibrary-button"
				title="add to canvas"
			>
				<Blocks size={15} />
			</button>

			<button
				onclick={handleRemove}
				disabled={appState.mediaItems.some((item) => item.sourceId === mediaItem.id)}
				class="mediaLibrary-button"
			>
				<Trash size={15} />
			</button>
		</div>
	</div>
</div>
