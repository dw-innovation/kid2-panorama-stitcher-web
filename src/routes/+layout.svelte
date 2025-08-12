<script lang="ts">
	import { appState } from '$lib/stores/state.svelte';
	import ModalHost from '$lib/ui/ModalHost.svelte';
	import { modalState } from '$src/lib/stores/modals.svelte';
	import Feedback from '$src/lib/ui/Feedback/Feedback.svelte';
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
		modalState.toggle('upload', true);

		return () => {
			window.removeEventListener('keydown', handleGlobalUndo);
		};
	});
</script>

<svelte:head>
	<title>You Stitch It! – Create Panoramas From Videos or Photos</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
	<Feedback />
	{@render children()}
	<ModalHost />
</QueryClientProvider>
