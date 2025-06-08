<script lang="ts">
	import { X } from '@lucide/svelte';
	import { onMount, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';

	let {
		children,
		onToggle
	}: {
		children: Snippet;
		onToggle?: (isOpen: boolean) => void;
	} = $props();

	let isOpen = $state(false);
	let modalRef = $state<HTMLElement>();

	const toggle = (newState?: boolean) => {
		isOpen = newState ?? !isOpen;
		onToggle?.(isOpen);
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (modalRef && !modalRef.contains(event.target as Node)) {
			toggle(false);
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			toggle(false);
		}
	};

	onMount(() => {
		document.addEventListener('click', handleClickOutside, true);
		document.addEventListener('keydown', handleKeydown, true);

		return () => {
			document.removeEventListener('click', handleClickOutside, true);
			document.removeEventListener('keydown', handleKeydown, true);
		};
	});

	export { toggle };
</script>

{#if isOpen}
	<div class="fixed inset-0 z-40 flex items-center justify-center bg-white/20! backdrop-blur-xs">
		<div class="z-50 rounded-sm bg-white p-4 shadow-lg" bind:this={modalRef}>
			<button onclick={() => toggle(false)} class="border-none shadow-none">
				<X />
			</button>
			<div>
				{@render children()}
			</div>
		</div>
	</div>
{/if}
