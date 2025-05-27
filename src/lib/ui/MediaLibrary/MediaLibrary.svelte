<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { PlusCircle } from '@lucide/svelte';
	import MediaDropZone from '../MediaDropZone.svelte';
	import Image from './Image.svelte';
	import Video from './Video.svelte';
</script>

<div class="mediaLibrary flex gap-2">
	<span class="pane-label">media library </span>
	<div class="flex flex-nowrap gap-2 overflow-x-auto">
		{#each appState.mediaItems as mediaItem}
			{#if mediaItem.mediaType === 'image'}
				<Image {mediaItem} />
			{/if}

			{#if mediaItem.mediaType === 'video'}
				<Video {mediaItem} />
			{/if}
		{/each}
	</div>

	<MediaDropZone>
		<PlusCircle />
		add media item
	</MediaDropZone>
</div>
