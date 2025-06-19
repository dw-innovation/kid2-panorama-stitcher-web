<script lang="ts">
	import { Expand } from '@lucide/svelte';
	import { onMount, type Snippet } from 'svelte';
	import Modal from '../Modal.svelte';

	let {
		label,
		children,
		disabled = false
	}: { label: string; children: Snippet; disabled?: boolean } = $props();

	let modal: Modal;

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
		<span>{label}</span>

		{#if !disabled}
			<button class="button--ghost" onclick={() => modal.toggle(true)}><Expand size={12} /></button>
		{/if}
	</span>

	<div class="flex h-full flex-col">
		{@render children?.()}
	</div>
</div>
