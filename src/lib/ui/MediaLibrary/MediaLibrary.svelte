<script lang="ts">
	import { appState } from '$lib/stores/state.svelte';
	import { PlusCircle } from '@lucide/svelte';
	import MediaDropZone from '../MediaDropZone.svelte';
	import Image from './Image.svelte';
	import Video from './Video.svelte';
	import groupBy from 'lodash/groupBy';
	import flatMap from 'lodash/flatMap';
	import sortBy from 'lodash/sortBy';
	import { cn } from '$src/lib/utils/lib';

	let orderedMediaItems = $derived(() => {
		const items = [...appState.mediaItems];

		// Group children by sourceId
		const childrenMap = groupBy(
			items.filter((i) => i.sourceId),
			'sourceId'
		);

		// Filter root items (no sourceId), keeping original order
		const roots = items.filter((i) => !i.sourceId);

		// Build the ordered list
		return flatMap(roots, (root) => {
			const children = sortBy(childrenMap[root.id] ?? [], (i) => i.timestamp ?? 0);
			return [root, ...children];
		});
	});
</script>

<div class="mediaLibrary flex gap-2">
	<span class="pane-label">media library</span>
	<div class="relative flex flex-nowrap gap-2 overflow-x-auto">
		{#each orderedMediaItems() as mediaItem}
			{#if mediaItem.mediaType === 'image'}
				<Image {mediaItem} />
			{/if}

			{#if mediaItem.mediaType === 'video'}
				<Video {mediaItem} />
			{/if}
		{/each}
	</div>

	<MediaDropZone>
		<div class="flex min-w-24 flex-col items-center gap-2">
			<PlusCircle />
			<span class="text-center select-none">add media item</span>
		</div>
	</MediaDropZone>
</div>
