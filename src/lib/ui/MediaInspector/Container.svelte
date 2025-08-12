<script lang="ts">
	import { Expand, InfoIcon } from '@lucide/svelte';
	import { onMount, type Snippet } from 'svelte';
	import Modal from '../Modal.svelte';
	import { tooltip } from '$src/lib/actions';

	let {
		label,
		children,
		disabled = false
	}: { label: string; children: Snippet; disabled?: boolean } = $props();

	let modal: Modal | undefined = $state();

	const handleKeyDown = (e: KeyboardEvent) => {
		if (disabled) return;
		if (e.key === 'f' || e.key === 'F') {
			modal.toggle();
		}
	};

	onMount(() => {
		document.addEventListener('keydown', handleKeyDown, true);

		return () => {
			document.removeEventListener('keydown', handleKeyDown, true);
		};
	});
</script>

{#if !disabled}
	<Modal bind:this={modal}>
		{@render children?.()}
	</Modal>
{/if}

<div class="mediaInspector relative h-full max-h-full flex-none">
	<span class="pane-label">
		<span>
			<div class="flex items-center gap-2">
				{label}
				<span
					use:tooltip
					class="cursor-help"
					title="Play videos and select frames [c] to add them to the Media library 

Add frames or images to the canvas [a] 

Turn off the sound  

Adjust the playback speed or view videos frame-by-frame  

Switch to full-screen mode and analyse a single image with the magnifier"
					><InfoIcon size={15} /></span
				>
			</div>
		</span>

		{#if !disabled}
			<button class="button--ghost" onclick={() => modal.toggle(true)}><Expand size={12} /></button>
		{/if}
	</span>

	<div class="flex h-full flex-col p-2">
		{@render children?.()}
	</div>
</div>
