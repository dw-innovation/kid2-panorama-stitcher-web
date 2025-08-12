<script lang="ts">
	import Logo from '$assets/Logo.svelte';
	import { modalState } from '../stores/modals.svelte';
</script>

<nav class="flex w-full items-center">
	<div class="flex gap-4">
		<Logo />
		<span class="text-nowrap">This app works best in Chrome and Firefox </span>
	</div>
	<ul class="flex w-full items-center justify-end gap-4 text-sm text-gray-500!">
		<li>
			<button
				onclick={() => modalState.toggle('about', true)}
				class="button--ghost text-sm! text-gray-500!"
			>
				about
			</button>
		</li>

		<li>
			<button
				onclick={() => modalState.toggle('privacy', true)}
				class="button--ghost text-sm! text-gray-500!"
			>
				legal & privacy
			</button>
		</li>
		<li>
			<a href="https://innovation.dw.com" target="_blank" class="hover:underline!">
				DW Innovation © 2025
			</a>
		</li>
	</ul>
</nav>
