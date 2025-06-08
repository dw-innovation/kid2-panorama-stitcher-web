<script lang="ts">
	import { stitchCanvasImages } from '$lib/lib';
	import { appState } from '$src/lib/state.svelte';
	import { stepsStore } from '$src/lib/steps.svelte';
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
		<div class="max-w-md rounded-md border border-red-300 bg-red-100 p-4 text-center text-red-800">
			<p class="font-semibold">Failed to generate panorama:</p>
			<p class="mt-1 text-sm">{$query.error.message}</p>
			<button
				class="mt-4 inline rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				onclick={() => stepsStore.setStep(1)}
			>
				Go back to frame selector
			</button>
		</div>
	{:else if $query.isSuccess && appState.panorama.file}
		<img
			src={appState.panorama.file.blobURL}
			style:width="inherit"
			style:height="inherit"
			alt="stitched panorama"
		/>
	{/if}

	{#if !sufficientItems}
		<p class="mt-4 text-sm text-gray-600">Select at least 2 items to create a panorama.</p>
	{/if}
</div>
