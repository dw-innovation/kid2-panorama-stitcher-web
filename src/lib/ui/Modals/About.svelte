<script lang="ts">
	import Modal from '../Modal.svelte';

	let modal: Modal;

	export const toggle = (open?: boolean) => modal?.toggle(open);
</script>

<Modal bind:this={modal} compact>
	Quis non ex proident dolore tempor Lorem culpa. Velit anim ad consectetur pariatur duis ex sit
	culpa qui do anim nulla. Lorem ullamco minim anim qui magna sit sint id proident.
</Modal>
