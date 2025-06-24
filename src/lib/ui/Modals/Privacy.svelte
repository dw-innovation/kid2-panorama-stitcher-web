<script lang="ts">
	import { consentState } from '$lib/stores/consents.svelte';
	import Modal from '../Modal.svelte';

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
		consentState.toggle('processing', true);
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

<Modal bind:this={modal}>
	<p>Do you agree to have your images processed on our servers for stitching?</p>

	<button onclick={handleAccept}>accept</button>
	<button onclick={handleReject}>reject</button>
</Modal>
