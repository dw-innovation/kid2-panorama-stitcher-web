<script lang="ts">
	import Navigation from '$lib/ui/Navigation.svelte';
	import { STEPS } from '$src/lib/shared/const';
	import { stepsStore } from '$src/lib/stores/steps.svelte';

	const CurrentComponent = $derived(STEPS[stepsStore.currentStep].component);
</script>

<header>
	<Navigation />
</header>

<main class="bg-amber-200">
	<CurrentComponent />
</main>
