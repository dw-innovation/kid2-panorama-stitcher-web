<script lang="ts">
	import { X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';

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

		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
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
	<div
		class="fixed inset-0 z-40 flex max-h-screen items-center justify-center bg-white/20! backdrop-blur-xs"
		in:fly={{ y: 50, duration: 300 }}
		out:fly={{ y: 50, duration: 300 }}
	>
		<div
			class="relative z-50 m-4 h-full overflow-hidden rounded-sm bg-white p-2 shadow-lg"
			bind:this={modalRef}
			style:max-height="calc(100% - 5rem)"
		>
			<button onclick={() => toggle(false)} class="button--ghost absolute top-2 right-2 z-20">
				<X />
			</button>
			<div class="relative h-full overflow-hidden py-4">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
