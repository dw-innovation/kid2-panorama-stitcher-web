<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { PlusCircle } from '@lucide/svelte';
	import MediaDropZone from '../MediaDropZone.svelte';
	import Image from './Image.svelte';
	import Video from './Video.svelte';
	import groupBy from 'lodash/groupBy';
	import flatMap from 'lodash/flatMap';
	import sortBy from 'lodash/sortBy';

	let orderedMediaItems = $derived(() => {
		const items = [...appState.mediaItems];

		// Group children by sourceId
		const childrenMap = _.groupBy(
			items.filter((i) => i.sourceId),
			'sourceId'
		);

		// Filter root items (no sourceId), keeping original order
		const roots = items.filter((i) => !i.sourceId);

		// Build the ordered list
		return _.flatMap(roots, (root) => {
			const children = _.sortBy(childrenMap[root.id] ?? [], (i) => i.timestamp ?? 0);
			return [root, ...children];
		});
	});
</script>

<div class="mediaLibrary flex gap-2">
	<span class="pane-label">media library</span>
	<div class="flex flex-nowrap gap-2 overflow-x-auto">
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
		<PlusCircle />
		<span class="select-none">add media item</span>
	</MediaDropZone>
</div>
