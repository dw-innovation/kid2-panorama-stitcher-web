<script lang="ts">
	import { STEPS } from '$lib/const';
	import { cn } from '$lib/lib';
	import { appState } from '$lib/state.svelte';
	import { stepsStore } from '$lib/steps.svelte';
</script>

<nav>
	<ul class="flex gap-2">
		{#each STEPS as step, index}
			<li>
				<button
					title={index === 2 && appState.canvasItems.length === 0
						? 'Please select some items to stitch first'
						: ''}
					onclick={() => stepsStore.setStep(index)}
					class={cn(
						stepsStore.currentStep === index && 'font-bold',
						'cursor-pointer',
						'border-0! bg-transparent! shadow-none! hover:bg-blue-100!'
					)}
					disabled={index === 2 && appState.canvasItems.length === 0}
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
