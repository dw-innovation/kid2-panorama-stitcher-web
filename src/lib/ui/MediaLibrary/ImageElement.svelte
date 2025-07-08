<script lang="ts">
	let { blobURL, id }: { blobURL: string; id: string } = $props();
	let naturalWidth = $state(0);
	let naturalHeight = $state(0);

	$effect(() => {
		if (blobURL) {
			const img = new Image();
			img.onload = () => {
				naturalWidth = img.naturalWidth;
				naturalHeight = img.naturalHeight;
			};
			img.src = blobURL;
		}
	});
</script>

<div
	class="h-full bg-cover bg-center bg-no-repeat"
	style:background-image="url({blobURL})"
	style:aspect-ratio="{naturalWidth} / {naturalHeight}"
	role="img"
	aria-label={id}
></div>
