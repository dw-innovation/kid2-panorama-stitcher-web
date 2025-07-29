<script lang="ts">
	import Modal from '../Modal.svelte';

	let modal: Modal;

	export const toggle = (open?: boolean) => modal?.toggle(open);
</script>

<Modal bind:this={modal} compact>Upload</Modal>
