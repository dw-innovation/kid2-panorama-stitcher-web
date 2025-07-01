<script lang="ts">
	let {
		blobURL,
		id,
		imageWidth = $bindable()
	}: { blobURL: string; id: string; imageWidth: number } = $props();

	let imageEl = $state<HTMLImageElement>();
	$effect(() => {
		if (!imageEl) return;
		const aspectRatio = imageEl?.naturalWidth / imageEl?.naturalHeight;
		imageWidth = imageEl?.clientHeight * aspectRatio;
	});
</script>

<img src={blobURL} alt={id} class="h-full w-auto" bind:this={imageEl} />
