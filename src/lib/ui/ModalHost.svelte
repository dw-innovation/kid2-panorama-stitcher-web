<script lang="ts">
	import Processing from './Modals/Processing.svelte';
	import { modalState } from '$lib/stores/modals.svelte';
	import type { Component } from 'svelte';
	import Tracking from './Modals/Tracking.svelte';

	const modalRegistry: Array<{ name: string; component: Component }> = [
		{ name: 'privacy', component: Processing },
		{ name: 'tracking', component: Tracking }
	];

	const modalInstances: Record<string, any> = {};

	$effect(() => {
		modalRegistry.forEach(({ name }) => {
			const instance = modalInstances[name];
			if (instance) {
				modalState.register(name, {
					name,
					toggle: (open?: boolean) => instance.toggle(open),
					awaitResult: () => instance.awaitResult?.()
				});
			}
		});
	});
</script>

{#each modalRegistry as { name, component }}
	{@const Component = component}
	<Component bind:this={modalInstances[name]} />
{/each}
