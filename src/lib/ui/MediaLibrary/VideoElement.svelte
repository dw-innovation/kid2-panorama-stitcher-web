<script lang="ts">
	let { blobURL }: { blobURL: string } = $props();
	let naturalWidth = $state(0);
	let naturalHeight = $state(0);
</script>

<video
	src={blobURL}
	playsinline
	preload="metadata"
	class="h-full max-h-full w-auto"
	style:aspect-ratio="{naturalWidth} / {naturalHeight}"
>
	<track kind="captions" />
</video>
