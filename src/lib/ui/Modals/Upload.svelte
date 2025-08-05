<script lang="ts">
	import { appState } from '$src/lib/stores/state.svelte';
	import { PlusCircle } from '@lucide/svelte';
	import DropZone from '../DropZone.svelte';
	import Modal from '../Modal.svelte';
	import Logo from '$assets/Logo.svelte';
	import { modalState } from '$src/lib/stores/modals.svelte';

	let modal: Modal;

	export const toggle = (open?: boolean) => modal?.toggle(open);
</script>

<Modal bind:this={modal} compact>
	<div class="flex flex-col items-center justify-center text-center">
		<Logo />
		<h1 class="mt-4 mb-2 text-xl font-bold">Create a Panorama from Your Video</h1>

		<p class="mb-2 text-lg">Start by uploading a media item.</p>

		<DropZone
			class="h-full w-full flex-1"
			onDrop={(files) => {
				files.forEach((file) => appState.addMediaItem(file));
				modalState.toggle('upload', false);
			}}
		>
			{#snippet children({ isDragActive, isDragAccept, isDragReject })}
				<div
					class="flex h-full flex-1 flex-col items-center gap-2 {isDragActive ? 'scale-105' : ''}"
				>
					<PlusCircle
						class={isDragAccept ? 'text-green-500' : isDragReject ? 'text-red-500' : ''}
					/>

					<span class=" text-center leading-tight select-none">
						{isDragActive ? (isDragAccept ? 'Drop files here' : 'Invalid files') : 'add media item'}
					</span>
				</div>
			{/snippet}
		</DropZone>
	</div>
</Modal>
