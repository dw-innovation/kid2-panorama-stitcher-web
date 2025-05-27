<script lang="ts">
	import '../app.css';
	import '@fontsource/inter/400.css';
	import '@fontsource/inter/600.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>DW Panorama Stitcher</title>
</svelte:head>

{@render children()}
