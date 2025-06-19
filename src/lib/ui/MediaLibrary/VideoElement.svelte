<script lang="ts">
	let { blobURL, id }: { blobURL: string; id: string } = $props();
	let naturalWidth = $state(0);
	let naturalHeight = $state(0);
</script>

<video
	src={blobURL}
	class="h-full max-h-full w-auto"
	style:aspect-ratio="{naturalWidth} / {naturalHeight}"
>
	<track kind="captions" />
</video>
