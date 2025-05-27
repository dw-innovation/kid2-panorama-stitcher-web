<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { ImagePlus, FileDown } from '@lucide/svelte';
	let videoElement: HTMLVideoElement | null = null;

	const handleCaptureFrame = async () => {
		if (!videoElement || !appState.selectedMediaItem) return;

		const selectedItem = appState.selectedMediaItem;
		const { videoWidth: width, videoHeight: height } = videoElement;

		const canvas = Object.assign(document.createElement('canvas'), { width, height });
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.drawImage(videoElement, 0, 0, width, height);

		canvas.toBlob(async (blob) => {
			if (!blob) return;

			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `frame-${timestamp}.png`;
			const file = new File([blob], filename, { type: 'image/png' });

			const newItem = await appState.addMediaItem(file, `Frame @ ${timestamp}`, selectedItem.id);
			if (newItem) {
				appState.addToCanvas(newItem.id, newItem.blobURL);
			}
		}, 'image/png');
	};
</script>

<div class="mediaInspector relative h-full max-h-full flex-none">
	<span class="pane-label">video inspector</span>

	<div class="flex h-full flex-col gap-2">
		<div class="flex gap-2">
			<button on:click={handleCaptureFrame} disabled={!appState.selectedMediaItem}>
				<ImagePlus size={12} />
				capture frame
			</button>
			<button on:click={() => {}}>
				<FileDown size={12} />
				download
			</button>
		</div>

		<div class="relative flex h-full flex-1 items-center justify-center overflow-hidden">
			<video
				src={appState.selectedMediaItem?.blobURL}
				controls
				height="fit-content"
				class="max-h-full self-center"
				bind:this={videoElement}
			>
				<track kind="captions" />
			</video>
		</div>
	</div>
</div>
