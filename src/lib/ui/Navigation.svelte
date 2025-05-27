<script lang="ts">
	import { STEPS } from '$lib/const';
	import { cn } from '$lib/lib';
	import { stepsStore } from '$lib/steps.svelte';
</script>

<nav>
	<ul class="flex gap-2">
		{#each STEPS as step, index}
			<li>
				<button
					onclick={() => stepsStore.setStep(index)}
					class={cn(stepsStore.currentStep === index && 'font-bold', 'cursor-pointer')}
				>
					{step.label}
				</button>
			</li>
		{/each}
	</ul>
</nav>
