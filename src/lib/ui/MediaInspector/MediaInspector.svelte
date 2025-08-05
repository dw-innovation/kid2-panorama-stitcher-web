<script lang="ts">
	import ImageInspector from './ImageInspector.svelte';
	import VideoInspector from './VideoInspector.svelte';
	import Hand from '$assets/hand.png?enhanced';
	import Container from './Container.svelte';
	import { appState } from '$src/lib/stores/state.svelte';
</script>

{#if appState.selectedMediaItem?.mediaType === 'image'}
	<Container label="inspector">
		<ImageInspector mediaItem={appState.selectedMediaItem} />
	</Container>
{:else if appState.selectedMediaItem?.mediaType === 'video'}
	<Container label="inspector">
		<VideoInspector mediaItem={appState.selectedMediaItem} />
	</Container>
{:else}
	<Container label="inspector" disabled>
		<div class="flex h-full w-full items-center justify-center">
			<div class="flex w-[10rem] flex-col items-center gap-2">
				<enhanced:img src={Hand} class="w-[5rem]" alt="hand" />
				<p class="text-center">select a media item from the gallery to inspect</p>
			</div>
		</div>
	</Container>
{/if}
