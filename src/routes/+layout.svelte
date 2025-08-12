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
	<meta
		name="description"
		content="With You Stitch It, you can create a panoramic image from multiple images or from a video. Panoramas provide you with a good overview of a situation, single images or vertical video may not show you the full picture. Just pick your keyframes, add them to the canvas and stitch it!"
	/>
	<meta
		name="keywords"
		content="panorama, image stitching, video panorama, photo stitching, panoramic images, image editing, video editing, keyframes, canvas, wide angle, photography tool"
	/>
	<meta name="author" content="You Stitch It" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta charset="utf-8" />

	<!-- OpenGraph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="You Stitch It! – Create Panoramas From Videos or Photos" />
	<meta
		property="og:description"
		content="With You Stitch It, you can create a panoramic image from multiple images or from a video. Panoramas provide you with a good overview of a situation, single images or vertical video may not show you the full picture. Just pick your keyframes, add them to the canvas and stitch it!"
	/>
	<meta property="og:image" content="/og-image.jpg" />
	<meta property="og:url" content="https://youstitch.it" />
	<meta property="og:site_name" content="You Stitch It" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta
		property="twitter:title"
		content="You Stitch It! – Create Panoramas From Videos or Photos"
	/>
	<meta
		property="twitter:description"
		content="With You Stitch It, you can create a panoramic image from multiple images or from a video. Panoramas provide you with a good overview of a situation, single images or vertical video may not show you the full picture. Just pick your keyframes, add them to the canvas and stitch it!"
	/>
	<meta property="twitter:image" content="/og-image.jpg" />

	<!-- Additional SEO -->
	<meta name="robots" content="index, follow" />
	<meta name="theme-color" content="#ffffff" />
	<link rel="canonical" href="https://youstitch.it" />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<Feedback />
	{@render children()}
	<ModalHost />
</QueryClientProvider>
