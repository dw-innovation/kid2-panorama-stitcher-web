<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from '../Modal.svelte';
	import { modalState } from '$lib/stores/modals.svelte';

	let modal: Modal;
	let content = $state('');
	let title = $state('Alert');

	const toggle = (open?: boolean, options?: { title?: string; content?: string }) => {
		if (options?.title) title = options.title;
		if (options?.content) content = options.content;
		modal?.toggle(open);
	};

	onMount(() => {
		modalState.register('alert', {
			name: 'alert',
			toggle
		});

		return () => {
			modalState.unregister('alert');
		};
	});
</script>

<Modal bind:this={modal} compact>
	<h3 class="mb-2 text-lg font-semibold">{title}</h3>
	<p class="text-gray-700">{content}</p>
</Modal>
