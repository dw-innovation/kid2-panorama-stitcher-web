<script lang="ts">
	import { STEPS } from '$lib/const';
	import { stepsStore } from '$lib/steps.svelte';
	import Navigation from '$lib/ui/Navigation.svelte';

	const CurrentComponent = $derived(STEPS[stepsStore.currentStep].component);
</script>

<header class="bg-red-300">
	<Navigation />
</header>

<main class="bg-amber-200">
	<CurrentComponent />
</main>
