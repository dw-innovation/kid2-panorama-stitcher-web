<script lang="ts">
	import { STEPS } from '$lib/shared/const';
	import { appState } from '$lib/stores/state.svelte';
	import { stepsStore } from '$lib/stores/steps.svelte';
	import { cn } from '$lib/utils/lib';
	import Logo from '$assets/Logo.svelte';

	let sufficientItems = $derived(appState.canvasItems.length < 2);
</script>

<nav class="flex w-full items-center">
	<div>
		<Logo />
	</div>
	<ul class="flex flex-1 justify-center gap-2">
		{#each STEPS as step, index (step)}
			<li>
				<button
					title={index === 2 && sufficientItems ? 'Please select some items to stitch first' : ''}
					onclick={() => stepsStore.setStep(index)}
					class={cn(
						stepsStore.currentStep === index && 'font-bold',
						'cursor-pointer',
						'border-0! bg-transparent! shadow-none! hover:bg-blue-100!'
					)}
					disabled={index === 2 && sufficientItems}
				>
					<span
						class={cn(
							'flex aspect-square w-8 items-center justify-center rounded-full  text-white',
							stepsStore.currentStep === index ? 'bg-black font-bold' : 'bg-slate-500'
						)}
					>
						{index + 1}
					</span>
					{step.displayName}
				</button>
			</li>
		{/each}
	</ul>
</nav>
