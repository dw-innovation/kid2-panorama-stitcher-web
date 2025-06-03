<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { ImagePlus, FileDown } from '@lucide/svelte';
	import Magnifier from './Magnifier.svelte';
	import { onDestroy, onMount } from 'svelte';

	const handleAddToCanvas = () => {
		const item = appState.selectedMediaItem;
		if (item) appState.addToCanvas(item.id, item.blobURL);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'a' || e.key === 'A') {
			handleAddToCanvas();
		}
	};

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyDown);
	});
</script>

<div class="mediaInspector relative h-full max-h-full flex-none">
	<span class="pane-label">image inspector</span>

	<div class="flex h-full flex-col gap-2">
		<div class="flex gap-2">
			<button onclick={handleAddToCanvas} disabled={!appState.selectedMediaItem}>
				<ImagePlus size={12} />
				add to canvas <kbd>a</kbd>
			</button>
			<button onclick={() => {}}>
				<FileDown size={12} />
				download
			</button>
		</div>

		<div class="relative flex h-full flex-1 items-center justify-center overflow-hidden">
			<Magnifier
				src={appState.selectedMediaItem?.blobURL}
				height="fit-content"
				alt=""
				className="max-h-full"
			/>
		</div>
	</div>
</div>
