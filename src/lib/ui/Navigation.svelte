<script lang="ts">
	import { appState } from '$lib/stores/state.svelte';
	import Logo from '$assets/Logo.svelte';
	import { modalState } from '../stores/modals.svelte';
</script>

<nav class="flex w-full items-center">
	<div>
		<Logo />
	</div>
	<ul class="flex w-full items-center justify-end gap-4 text-base">
		<li>
			<a href="https://innovation.dw.com" target="_blank" class="hover:underline!">
				DW Innovation | 2025
			</a>
		</li>
		<li>
			<button onclick={() => modalState.toggle('about', true)} class="button--ghost text-base!">
				about
			</button>
		</li>
		<li>
			<button onclick={() => modalState.toggle('privacy', true)} class="button--ghost text-base!">
				legal & privacy
			</button>
		</li>
	</ul>
</nav>
