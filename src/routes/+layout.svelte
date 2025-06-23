<script lang="ts">
	import { appState } from '$lib/stores/state.svelte';
	import { modalState } from '$lib/stores/modals.svelte';
	import ModalHost from '$lib/ui/ModalHost.svelte';
	import '../app.css';
	import '@fontsource/inter/400.css';
	import '@fontsource/inter/600.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';

	let { children } = $props();
	const queryClient = new QueryClient();

	const handleGlobalUndo = (e: KeyboardEvent) => {
		const isUndo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
		if (isUndo) {
			e.preventDefault();
			appState.undo();
		}
	};

	onMount(() => {
		window.addEventListener('keydown', handleGlobalUndo);

		return () => {
			window.removeEventListener('keydown', handleGlobalUndo);
		};
	});
</script>

<svelte:head>
	<title>DW Panorama Stitcher</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
	{@render children()}
	<ModalHost />
</QueryClientProvider>
