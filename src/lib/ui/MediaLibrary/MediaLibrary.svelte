<script lang="ts">
	import { appState } from '$lib/stores/state.svelte';
	import { PlusCircle } from '@lucide/svelte';
	import DropZone from '../DropZone.svelte';
	import Image from './Image.svelte';
	import Video from './Video.svelte';
	import groupBy from 'lodash/groupBy';
	import flatMap from 'lodash/flatMap';
	import sortBy from 'lodash/sortBy';

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

<div class="mediaLibrary flex h-full flex-col">
	<span class="pane-label">media library</span>

	<div class="flex min-h-0 flex-1 gap-2 p-2">
		<div class="h-full w-32">
			<DropZone
				class="h-full flex-1"
				onDrop={(files) => {
					files.forEach((file) => appState.addMediaItem(file));
				}}
			>
				{#snippet children({ isDragActive, isDragAccept, isDragReject })}
					<div
						class="flex h-full flex-1 flex-col items-center gap-2 {isDragActive ? 'scale-105' : ''}"
					>
						<PlusCircle
							class={isDragAccept ? 'text-green-500' : isDragReject ? 'text-red-500' : ''}
						/>
						<span class=" text-center leading-tight select-none">
							{isDragActive
								? isDragAccept
									? 'Drop files here'
									: 'Invalid files'
								: 'add media item'}
						</span>
					</div>
				{/snippet}
			</DropZone>
		</div>

		<div class="relative flex w-full flex-nowrap gap-2 overflow-x-auto">
			{#each orderedMediaItems() as mediaItem}
				{#if mediaItem.mediaType === 'image'}
					<Image {mediaItem} />
				{/if}

				{#if mediaItem.mediaType === 'video'}
					<Video {mediaItem} />
				{/if}
			{/each}
		</div>
	</div>
</div>
