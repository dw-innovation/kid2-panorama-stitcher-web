<script lang="ts">
	import { appState } from '$src/lib/state.svelte';
	import '../app.css';
	import '@fontsource/inter/400.css';
	import '@fontsource/inter/600.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	let { children } = $props();
	const queryClient = new QueryClient();
</script>

<svelte:head>
	<title>DW Panorama Stitcher</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
