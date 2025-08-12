<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import { ThumbsUp, ThumbsDown, MessageCircle, Check } from '@lucide/svelte';

	let step: 'initial' | 'text' | 'done' = $state('initial');
	let thumbs: boolean | undefined = $state(undefined);
	let text = $state('');

	const saveFeedback = async (data: { thumbs?: boolean; text?: string }) => {
		const response = await fetch('/api/feedback', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			throw new Error('Failed to save feedback');
		}

		return await response.json();
	};

	const mutation = createMutation({
		mutationFn: saveFeedback,
		onSuccess: () => (step = 'done')
	});

	const handleThumb = (value: boolean) => {
		thumbs = value;
		step = 'text';
	};

	const handleTextSubmit = () => {
		if (!text.trim()) return;
		$mutation.mutate({ thumbs, text });
	};
</script>

<div class="feedback-widget group fixed right-0 bottom-10 z-50">
	<div class="flex translate-x-[calc(100%-48px)] transition-transform group-hover:translate-x-0">
		<!-- Orange tab -->
		<div class="flex h-12 w-12 items-center justify-center rounded-l-lg bg-orange-600 text-white">
			<MessageCircle size={18} />
		</div>

		<!-- Main content -->
		<div class="h-32 w-52">
			{#if step === 'initial'}
				<div class="flex h-12 items-center gap-3 bg-white p-3">
					<span class="text-sm font-medium">Enjoying this app?</span>
					<div class="ml-auto flex gap-2">
						<button
							class="rounded p-1 text-green-600! hover:bg-green-50!"
							onclick={() => handleThumb(true)}
						>
							<ThumbsUp size={18} />
						</button>
						<button
							class="rounded p-1 text-red-600! hover:bg-red-50!"
							onclick={() => handleThumb(false)}
						>
							<ThumbsDown size={18} />
						</button>
					</div>
				</div>
			{:else if step === 'text'}
				<div class="flex h-full flex-col bg-white p-3">
					<textarea
						bind:value={text}
						placeholder="Tell us more..."
						class="w-full flex-1 resize-none border-0 text-sm focus:outline-none"
					></textarea>
					<button
						onclick={handleTextSubmit}
						disabled={!text.trim() || $mutation.isPending}
						class="w-full rounded bg-orange-600 px-3 py-1 text-sm text-white hover:bg-orange-700 disabled:opacity-50"
					>
						Send
					</button>
				</div>
			{:else}
				<div class="flex h-12 items-center gap-2 bg-white p-3">
					<Check size={16} class="text-green-600" />
					<span class="text-sm">Thanks!</span>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.feedback-widget:hover .group-hover\:translate-x-0 {
		transform: translateX(0);
	}
</style>
