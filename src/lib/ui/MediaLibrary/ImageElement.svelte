<script lang="ts">
	let { blobURL, id, sourceId }: { blobURL: string; id: string; sourceId: string | undefined } =
		$props();
	let naturalWidth = $state(0);
	let naturalHeight = $state(0);
</script>

<img
	bind:naturalWidth
	bind:naturalHeight
	src={blobURL}
	alt={id}
	class="h-full max-h-full w-auto"
	style:aspect-ratio="{naturalWidth} / {naturalHeight}"
/>
