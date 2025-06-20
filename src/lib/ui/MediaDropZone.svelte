<script lang="ts">
	import Dropzone from 'svelte-file-dropzone';
	import type { Snippet } from 'svelte';
	import { appState } from '../stores/state.svelte';

	let { children, onSelect }: { children: Snippet; onSelect?: () => void } = $props();

	interface FileDropEventDetail {
		acceptedFiles: File[];
		fileRejections: File[];
	}

	const handleFilesSelect = (e: CustomEvent<FileDropEventDetail>) => {
		const { acceptedFiles } = e.detail;

		acceptedFiles.forEach((file) => {
			appState.addMediaItem(file);
		});

		if (onSelect) onSelect();
	};
</script>

<Dropzone
	on:drop={handleFilesSelect}
	noKeyboard
	accept=".png,.jpg,.jpeg,.mp4,.webm,.mov"
	containerClasses="flex justify-center!"
>
	{@render children?.()}
</Dropzone>
