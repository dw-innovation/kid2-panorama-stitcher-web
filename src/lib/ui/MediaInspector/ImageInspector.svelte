<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { ImagePlus, FileDown } from '@lucide/svelte';
	import Magnifier from './Magnifier.svelte';
	import { onMount } from 'svelte';
	import { handleDownload } from '$src/lib/lib';

	const handleAddToCanvas = () => {
		// if images is already on the canvas or selectedMediaItem is undefined return
		if (
			!appState.selectedMediaItem ||
			appState.canvasItems.some((item) => item.sourceId === appState.selectedMediaItem?.id)
		)
			return;

		const item = appState.selectedMediaItem;
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

<div class="mediaInspector relative h-full max-h-full flex-none">
	<span class="pane-label">image inspector</span>

	<div class="flex h-full flex-col gap-2">
		<div class="flex gap-2">
			<button
				onclick={handleAddToCanvas}
				disabled={!appState.selectedMediaItem ||
					appState.canvasItems.some((item) => item.sourceId === appState.selectedMediaItem?.id)}
			>
				<ImagePlus size={12} />
				add to canvas <kbd>a</kbd>
			</button>
			<button
				onclick={() =>
					appState.selectedMediaItem?.id && handleDownload(appState.selectedMediaItem?.id)}
			>
				<FileDown size={12} />
				download
			</button>
		</div>

		<div class="relative flex h-full flex-1 items-center justify-center overflow-hidden">
			<Magnifier
				src={appState.selectedMediaItem?.blobURL}
				height="fit-content"
				alt=""
				className="h-[inherit]"
			/>
		</div>
	</div>
</div>
