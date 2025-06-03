<script lang="ts">
	let { blobURL, id }: { blobURL: string; id: string } = $props();
	let naturalWidth = $state(0);
	let naturalHeight = $state(0);
</script>

<img
	bind:naturalWidth
	bind:naturalHeight
	src={blobURL}
	alt={id}
	class="object-fit h-full max-h-full w-auto"
	style:aspect-ratio="{naturalWidth} / {naturalHeight}"
/>
