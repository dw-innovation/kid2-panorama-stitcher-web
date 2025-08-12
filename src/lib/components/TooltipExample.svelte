<script lang="ts">
	import { tooltip } from '$lib/actions';
</script>

<div class="example-container">
	<h2>Tooltip Examples</h2>
	
	<div class="examples">
		<!-- Basic tooltip with title attribute -->
		<button 
			use:tooltip
			title="This is a basic tooltip from the title attribute"
			class="btn"
		>
			Hover me (title)
		</button>

		<!-- Custom content tooltip -->
		<button 
			use:tooltip={{ content: "This is custom tooltip content that can be longer and more detailed!" }}
			class="btn"
		>
			Hover me (custom)
		</button>

		<!-- Tooltip with specific placement -->
		<button 
			use:tooltip={{ 
				content: "I always appear on top!", 
				placement: "top" 
			}}
			class="btn"
		>
			Top tooltip
		</button>

		<!-- Tooltip with custom delay and styling -->
		<button 
			use:tooltip={{ 
				content: "Slower to appear, wider tooltip", 
				delay: 500,
				maxWidth: 400
			}}
			class="btn"
		>
			Slow & Wide
		</button>

		<!-- Edge case: very long content -->
		<button 
			use:tooltip={{ 
				content: "This is a very long tooltip content that should wrap nicely and not exceed the maximum width constraint that we've set. It should be readable and properly positioned.",
				maxWidth: 250
			}}
			class="btn"
		>
			Long content
		</button>
	</div>
</div>

<style>
	.example-container {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.examples {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 1rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		background: #007acc;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		transition: background-color 0.2s;
	}

	.btn:hover {
		background: #005a99;
	}

	.btn:focus {
		outline: 2px solid #007acc;
		outline-offset: 2px;
	}
</style>