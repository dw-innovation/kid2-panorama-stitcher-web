<script lang="ts">
	import { Check, XIcon } from '@lucide/svelte';
	import Modal from '../Modal.svelte';
	import { appState } from '$src/lib/stores/state.svelte';

	let modal: Modal;
	let resolvePromise: ((value: boolean) => void) | null = null;

	export const toggle = (open?: boolean) => modal?.toggle(open);

	export const awaitResult = (): Promise<boolean> => {
		return new Promise((resolve) => {
			resolvePromise = resolve;
			modal?.toggle(true);
		});
	};

	const handleAccept = () => {
		appState.toggle('tracking', true);
		modal.toggle(false);
		resolvePromise?.(true);
		resolvePromise = null;
	};

	const handleReject = () => {
		modal.toggle(false);
		resolvePromise?.(false);
		resolvePromise = null;
	};
</script>

<Modal bind:this={modal} compact>
	<p>Do you really want to delete this element</p>
	<div class="mt-4 flex gap-2">
		<button onclick={handleAccept} class="flex-1 bg-green-100">
			<Check /> yes
		</button>
		<button onclick={handleReject} class="flex-1 bg-red-100">
			<XIcon /> no
		</button>
	</div>
</Modal>
