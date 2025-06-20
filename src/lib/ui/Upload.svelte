<script lang="ts">
	import MediaDropZone from './MediaDropZone.svelte';
	import { stepsStore } from '$lib/stores/steps.svelte';
	import Hand from '$assets/hand.png?enhanced';
	import Illustration from '$assets/illustration.png?enhanced';
</script>

<div class="flex h-full flex-col items-center justify-center gap-4 bg-[#3188db] p-4">
	<enhanced:img src={Illustration} class="w-[20rem]" alt="illustration" />

	<h1 class="font-inter text-center text-3xl font-bold text-white">
		Create a panorama from your video and photos!
	</h1>

	<enhanced:img src={Hand} class="w-[5rem]" alt="hand" />

	<MediaDropZone onSelect={() => stepsStore.setStep(1)}>
		Click here or drag and drop your files to stitch
	</MediaDropZone>
</div>
