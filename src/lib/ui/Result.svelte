<script lang="ts">
	import { appState } from '../state.svelte';
</script>

<div class="relative flex h-full justify-center">
	{#if appState.panorama}
		<img
			src={appState.panorama.blobURL}
			style:width="inherit"
			style:height="inherit"
			alt="stitched panorama"
		/>
	{/if}
</div>
