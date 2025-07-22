<script lang="ts">
	import { appState } from '$lib/stores/state.svelte';
	import type { MediaItem } from '$lib/shared/types';
	import { SearchIcon } from '@lucide/svelte';

	let { mediaItem }: { mediaItem: MediaItem } = $props();
</script>

<button
	class="absolute top-0 left-0 z-10 flex h-full w-full cursor-pointer items-center justify-center rounded-none! opacity-0 transition-all hover:bg-slate-200/40 hover:opacity-100"
	onclick={() => appState.selectMediaItem(mediaItem.id)}
>
	<SearchIcon />
</button>
