<script lang="ts">
	import { handleDownload, stitchCanvasImages } from '$lib/lib';
	import { appState } from '$src/lib/state.svelte';
	import { stepsStore } from '$src/lib/steps.svelte';
	import { ArrowLeft, Download } from '@lucide/svelte';
	import { createQuery } from '@tanstack/svelte-query';

	let sufficientItems = $derived(appState.canvasItems.length > 1);

	const query = createQuery({
		queryKey: ['stitchedImage', appState.canvasItems.map((item) => item.id)],
		queryFn: () => stitchCanvasImages(appState.canvasItems),
		enabled: appState.canvasItems.length > 1,
		retry: false
	});

	$effect(() => {
		if ($query.isSuccess && $query.data) {
			appState.setPanorama($query.data);
		}
	});
</script>

<div class="relative flex h-full flex-col items-center justify-center">
	{#if $query.isLoading}
		<div class="flex flex-col items-center">
			<div
				class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600"
			></div>
			<p class="text-sm text-gray-700">Stitching your selected frames into a panorama…</p>
		</div>
	{:else if $query.isError}
		<div
			class="flex max-w-md flex-col justify-center gap-2 rounded-md border border-red-300 bg-red-100 p-4 text-center text-red-800"
		>
			<p class="font-semibold">Failed to generate panorama</p>
			<p class="text-sm">
				Sorry, we couldn't detect enough overlap to stitch these images. You can download your
				canvas with your self created panorama
			</p>
			<button
				class="mt-4 inline rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				onclick={() => stepsStore.setStep(1)}
			>
				Go back to frame selector
			</button>
		</div>
	{:else if $query.isSuccess && appState.panorama}
		<div class="flex h-full flex-col items-center gap-2">
			<div class="flex gap-2">
				<button onclick={() => stepsStore.setStep(1)} class="inline-block w-fit">
					<ArrowLeft size={15} /> Go back to frame selector
				</button>
				<button
					onclick={() =>
						appState.panorama?.blobURL && handleDownload(appState.panorama?.blobURL, 'panorama')}
					class="inline-block w-fit"
				>
					<Download size={15} /> Panorama
				</button>
			</div>
			<img
				class="flex-1"
				src={appState.panorama.blobURL}
				style:width="inherit"
				style:height="inherit"
				alt="stitched panorama"
			/>
		</div>
	{/if}

	{#if !sufficientItems}
		<p class="mt-4 text-sm text-gray-600">Select at least 2 items to create a panorama.</p>
	{/if}
</div>
