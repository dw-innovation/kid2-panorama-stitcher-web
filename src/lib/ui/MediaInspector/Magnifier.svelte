<script lang="ts">
	let {
		src,
		alt,
		width = '100%',
		height = 'auto',
		className = '',
		zoomImgSrc = '',
		zoomFactor = 1.5,
		mgWidth = 150,
		mgHeight = 150,
		mgBorderWidth = 2,
		mgShape = 'circle',
		mgShowOverflow = true,
		mgMouseOffsetX = 0,
		mgMouseOffsetY = 0,
		mgTouchOffsetX = -50,
		mgTouchOffsetY = -50,
		disabled = false,
		...restProps
	} = $props();

	let img = $state<HTMLImageElement>();
	let imgBounds = $state<DOMRect>();
	let showZoom = $state(false);
	let mgOffsetX = $state(0);
	let mgOffsetY = $state(0);
	let relX = $state(0);
	let relY = $state(0);

	function calcImgBounds() {
		if (img) {
			imgBounds = img.getBoundingClientRect();
		}
	}

	function onMouseMove(e: MouseEvent) {
		if (imgBounds) {
			const target = e.target as HTMLElement;
			relX = (e.clientX - imgBounds.left) / target.clientWidth;
			relY = (e.clientY - imgBounds.top) / target.clientHeight;
			mgOffsetX = mgMouseOffsetX;
			mgOffsetY = mgMouseOffsetY;
			showZoom = true;
		}
	}

	function onTouchMove(e: TouchEvent) {
		if (imgBounds) {
			const target = e.target as HTMLElement;
			const _relX = (e.targetTouches[0].clientX - imgBounds.left) / target.clientWidth;
			const _relY = (e.targetTouches[0].clientY - imgBounds.top) / target.clientHeight;

			if (_relX >= 0 && _relY >= 0 && _relX <= 1 && _relY <= 1) {
				mgOffsetX = mgTouchOffsetX;
				mgOffsetY = mgTouchOffsetY;
				relX = _relX;
				relY = _relY;
				showZoom = true;
			} else {
				showZoom = false;
			}
		}
	}
</script>

<div class="magnifier {className}" class:no-overflow={mgShowOverflow}>
	<img
		{src}
		{alt}
		class="magnifier-image"
		style="width: 100%; height: 100%; object-fit: contain;"
		bind:this={img}
		onload={calcImgBounds}
		onmouseenter={calcImgBounds}
		ontouchstart={(e) => {
			e.preventDefault();
			calcImgBounds();
		}}
		onmousemove={onMouseMove}
		ontouchmove={onTouchMove}
		onmouseout={() => (showZoom = false)}
		ontouchend={() => (showZoom = false)}
		onblur={() => {}}
		{...restProps}
	/>
	{#if imgBounds}
		<div
			class="magnifying-glass"
			class:visible={showZoom && !disabled}
			class:circle={mgShape === 'circle'}
			style="
          width: {mgWidth}px;
          height: {mgHeight}px;
          left: calc({relX * 100}% - {mgWidth / 2}px + {mgOffsetX}px - {mgBorderWidth}px);
          top: calc({relY * 100}% - {mgHeight / 2}px + {mgOffsetY}px - {mgBorderWidth}px);
          background-image: url('{zoomImgSrc || src}');
          background-position: calc({relX * 100}% + {mgWidth / 2}px - {relX * mgWidth}px) 
                             calc({relY * 100}% + {mgHeight / 2}px - {relY * mgWidth}px);
          background-size: {zoomFactor * imgBounds.width}% {zoomFactor * imgBounds.height}%;
          border-width: {mgBorderWidth}px;"
		></div>
	{/if}
</div>

<style lang="postcss">
	.magnifier {
		position: relative;
		display: inline-block;
		line-height: 0;
	}

	.magnifier-image {
		cursor: none;
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.magnifying-glass {
		position: absolute;
		z-index: 1;
		background: #e5e5e5 no-repeat;
		border: solid #ebebeb;
		box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3);
		opacity: 0;
		transition: opacity 0.3s;
		pointer-events: none;

		&.circle {
			border-radius: 50%;
		}

		&.visible {
			opacity: 1;
		}
	}

	.no-overflow {
		overflow: hidden;
	}
</style>
