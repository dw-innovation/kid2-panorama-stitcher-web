<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import type { MediaItem } from '$lib/types';
	import { SearchIcon, Video } from '@lucide/svelte';

	let { mediaItem }: { mediaItem: MediaItem } = $props();
</script>

<button
	class="absolute top-0 left-0 z-10 flex h-full w-full cursor-pointer items-center justify-center rounded-none! opacity-0 transition-all hover:bg-slate-200/40 hover:opacity-100"
	onclick={() => appState.selectMediaItem(mediaItem.id)}
>
	{#if mediaItem.mediaType === 'image'}
		<SearchIcon />
	{:else if mediaItem.mediaType === 'video'}
		<Video />
	{/if}
</button>
