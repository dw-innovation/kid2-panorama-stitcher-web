<script lang="ts">
	import type { MediaItem } from '$lib/shared/types';
	import { Image, ImagePlus, Trash } from '@lucide/svelte';
	import ImageElement from './ImageElement.svelte';
	import AddToInspectorOverlay from './AddToInspectorOverlay.svelte';
	import { appState } from '$lib/stores/state.svelte';
	import { cn } from '$src/lib/utils/lib';
	import { modalState } from '$src/lib/stores/modals.svelte';

	let { mediaItem }: { mediaItem: MediaItem } = $props();

	const handleRemove = async () => {
		const confirmed = await modalState.awaitResult('delete');

		if (confirmed) {
			appState.removeMediaItem(mediaItem.id);
		}
	};

	const handleAddToCanvas = () => {
		if (appState.canvasItems.some((item) => item.sourceId === mediaItem.id)) {
			modalState.toggle('alert', true, {
				title: 'Image Already Added',
				content: 'This image is already on the canvas.'
			});
			return;
		}

		appState.addToCanvas(mediaItem.id, mediaItem.blobURL);
	};
</script>

<div class:pt-6={mediaItem.sourceId} class="relative">
	{#if mediaItem.sourceId}
		<div
			class="absolute top-4 -left-2 h-2 -translate-x-1/2 border-t-2 border-r-2 border-[#5b5b5b]"
			style:width="calc(100% + 1rem)"
		></div>
	{/if}

	<div
		class="group relative z-20 h-full w-fit {cn(
			appState.selectedMediaItem?.id === mediaItem.id &&
				'outline-2 -outline-offset-2 outline-blue-500'
		)}"
	>
		<div class="absolute bottom-2 left-2 z-50 rounded-md bg-white/60 p-[2px]">
			<Image size={20} />
		</div>

		<ImageElement blobURL={mediaItem.blobURL} id={mediaItem.id} />

		<AddToInspectorOverlay {mediaItem} />

		<div
			class="absolute top-2 right-2 z-20 flex gap-1 opacity-0 transition-all group-hover:opacity-100"
		>
			<button
				onclick={handleAddToCanvas}
				class="mediaLibrary-button"
				title="add to canvas"
			>
				<ImagePlus size={15} />
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
