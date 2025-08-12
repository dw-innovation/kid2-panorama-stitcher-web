<script lang="ts">
	import Modal from '../Modal.svelte';

	let modal: Modal;

	export const toggle = (open?: boolean) => modal?.toggle(open);
</script>

<Modal bind:this={modal} compact>
	<div class="prose prose-sm h-[60vh] max-w-none overflow-y-auto">
		<h1>About You Stitch It</h1>

		<p>
			Using You Stitch It, you can create a panoramic image by combining multiple video and/or photo
			frames to capture a broader view of a scene.
		</p>

		<h2>Why</h2>

		<p>
			Panoramas help you understand situations better, including what happened and where. Single
			frames or vertical video may not show the full picture.
		</p>

		<p>
			With You Stitch It, you can analyse each frame individually and multiple frames will
			automatically be stitched together into a single panorama.
		</p>

		<h2>How</h2>

		<p>
			You Stitch It works best with the Chrome and Firefox browsers. Upload images (any filetype)
			and videos (mov, avi, and mp4) from your computer to the library, then start selecting your
			favourite frames. If you encounter any issues, please contact us here. Happy stitching!
		</p>

		<p>
			You Stitch It has been created by <a href="https://innovation.dw.com/" target="_blank">
				DW Innovation
			</a>
			and is co-funded by the German
			<a href="https://www.bmftr.bund.de/DE/Home/home_node.html" target="_blank">BMFTR</a> via the KID2
			Project.
		</p>
	</div>
</Modal>

<style>
	@reference "$src/app.css";

	.prose h1 {
		@apply mb-4 text-2xl font-bold;
	}

	.prose h2 {
		@apply mt-6 mb-3 text-xl font-semibold;
	}

	.prose p {
		@apply mb-4;
	}

	.prose a {
		@apply underline;
	}
	.prose a:hover {
		@apply no-underline;
	}
</style>
