<script lang="ts">
	import Canvas from './Canvas.svelte';
	import MediaInspector from './MediaInspector/MediaInspector.svelte';
	import MediaLibrary from './MediaLibrary/MediaLibrary.svelte';
</script>

<div class="frameSelector">
	<MediaLibrary />

	<MediaInspector />

	<Canvas />
</div>
