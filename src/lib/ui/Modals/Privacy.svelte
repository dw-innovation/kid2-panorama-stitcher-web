<script lang="ts">
	import { appState } from '$lib/stores/state.svelte';
	import Modal from '../Modal.svelte';

	let modal: Modal;

	export const toggle = (open?: boolean) => modal?.toggle(open);
</script>

<Modal bind:this={modal}>
	<p>Do you agree to have your images processed on our servers for stitching?</p>

	<button onclick={() => appState.toggleConsent('processing', true)}>accept</button>
	<button onclick={() => modal.toggle(false)}>reject</button>
</Modal>
