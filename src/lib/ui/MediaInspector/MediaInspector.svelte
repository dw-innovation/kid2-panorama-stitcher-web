<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import ImageInspector from './ImageInspector.svelte';
	import VideoInspector from './VideoInspector.svelte';
	import Hand from '../../../assets/hand.png?enhanced';
</script>

{#if appState.selectedMediaItem?.mediaType === 'image'}
	<ImageInspector mediaItem={appState.selectedMediaItem} />
{:else if appState.selectedMediaItem?.mediaType === 'video'}
	<VideoInspector mediaItem={appState.selectedMediaItem} />
{:else}
	<div class="mediaInspector relative h-full max-h-full flex-none">
		<span class="pane-label">media inspector</span>
		<div class="flex h-full w-full items-center justify-center">
			<div class="flex w-[10rem] flex-col items-center gap-2">
				<enhanced:img src={Hand} class="w-[5rem] rotate-180" alt="hand" />
				<p class="text-center">select a media item from the gallery to inspect</p>
			</div>
		</div>
	</div>
{/if}
