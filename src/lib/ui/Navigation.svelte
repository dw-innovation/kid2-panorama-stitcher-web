<script lang="ts">
	import { STEPS } from '$lib/shared/const';
	import { appState } from '$lib/stores/state.svelte';
	import { stepsStore } from '$lib/stores/steps.svelte';
	import { cn } from '$lib/utils/lib';
	import Logo from '$assets/Logo.svelte';
	import { modalState } from '../stores/modals.svelte';

	let sufficientItems = $derived(appState.canvasItems.length < 2);
</script>

<nav class="flex w-full items-center">
	<div>
		<Logo />
	</div>
	<ul class="flex w-full items-center justify-end gap-4">
		<li>
			<a href="https://innovation.dw.com" target="_blank" class="hover:underline"
				>DW Innovation | 2025</a
			>
		</li>
		<li>
			<button onclick={() => modalState.toggle('about', true)} class="button--ghost text-lg!">
				about
			</button>
		</li>
		<li>
			<button onclick={() => modalState.toggle('privacy', true)} class="button--ghost text-lg!">
				privacy
			</button>
		</li>
	</ul>
</nav>
