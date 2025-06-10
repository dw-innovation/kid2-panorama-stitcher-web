<script lang="ts">
	import type { MediaItem } from '$lib/types';
	import { FileDown, Trash } from '@lucide/svelte';
	import ImageElement from './ImageElement.svelte';
	import AddToInspectorOverlay from './AddToInspectorOverlay.svelte';
	import { appState } from '$lib/state.svelte';
	import { cn } from '$src/lib/lib';

	let { mediaItem }: { mediaItem: MediaItem } = $props();

	let convertedURL = $state<string | undefined>(undefined);

	const downloadAsJPEG = async () => {
		convertedURL = await convertToJPEG();
		if (convertedURL) {
			triggerDownload(convertedURL, 'converted.jpg');
		}
	};

	const convertToJPEG = async () => {
		const response = await fetch(mediaItem.blobURL);
		const blob = await response.blob();

		if (blob.type === 'image/jpeg') {
			convertedURL = mediaItem.blobURL;
			triggerDownload(convertedURL, 'image.jpg');
			return;
		}

		const img = await createImageBitmap(blob);
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;

		const ctx = canvas.getContext('2d');
		ctx?.drawImage(img, 0, 0);

		const jpegBlob = await new Promise<Blob>((resolve) =>
			canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9)
		);

		return URL.createObjectURL(jpegBlob);
	};

	const triggerDownload = (url: string, filename: string) => {
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	const handleRemove = () => {
		appState.removeMediaItem(mediaItem.id);
	};
</script>

<div class:pt-6={mediaItem.sourceId} class="relative">
	{#if mediaItem.sourceId}
		<div
			class="absolute top-4 -left-2 h-2 -translate-x-1/2 border-t-2 border-r-2 border-[#5b5b5b]"
			style:width="calc(100% + 0.5rem)"
		></div>
	{/if}
	<div class={cn('group relative z-50 h-full flex-none')} style:width="max-content">
		<ImageElement blobURL={mediaItem.blobURL} id={mediaItem.id} />

		<AddToInspectorOverlay {mediaItem} />

		<div
			class="absolute top-2 right-2 z-20 flex gap-1 opacity-0 transition-all group-hover:opacity-100"
		>
			<button onclick={downloadAsJPEG} class="mediaLibrary-button">
				<FileDown size={15} />
			</button>

			<button onclick={handleRemove} class="mediaLibrary-button">
				<Trash size={15} />
			</button>
		</div>
	</div>
</div>
