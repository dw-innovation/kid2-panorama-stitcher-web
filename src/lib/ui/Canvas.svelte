<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { Canvas, FabricImage, type ModifiedEvent, type TEvent, type TPointerEvent } from 'fabric';
	import { appState } from '$lib/state.svelte';
	import type { CanvasObject } from '$lib/types';
	import { Aperture, Download } from '@lucide/svelte';
	import { stitchCanvasImages } from '$lib/lib';
	import { stepsStore } from '../steps.svelte';

	let canvasEl: HTMLCanvasElement;
	let canvasContainer: HTMLDivElement;
	let fabricCanvas: Canvas;
	let canvasItemIds = $derived(new Set(appState.canvasItems.map((item) => item.id)));

	let toRemove = $derived(() => {
		const currentObjects = (fabricCanvas?.getObjects() as CanvasObject[]) ?? [];

		return currentObjects.filter((obj) => !canvasItemIds.has(obj._id));
	});

	let toAdd = $derived(() => {
		const currentObjects = (fabricCanvas?.getObjects() as CanvasObject[]) ?? [];

		const currentIds = new Set(currentObjects.map((obj) => obj._id));

		return appState.canvasItems.filter((item) => !currentIds.has(item.id));
	});

	const resizeCanvas = async () => {
		await tick();
		if (canvasContainer && fabricCanvas) {
			const width = canvasContainer.clientWidth;
			const height = canvasContainer.clientHeight;
			canvasEl.width = width;
			canvasEl.height = height;
			fabricCanvas.setDimensions({ width, height });
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Delete' || e.key === 'Backspace') {
			const selected = fabricCanvas.getActiveObjects?.() ?? [];

			if (selected.length === 0) return;

			const idsToRemove = selected.map((obj) => (obj as CanvasObject)._id).filter(Boolean);

			if (idsToRemove.length > 0) {
				appState.removeFromCanvasItems(idsToRemove);
			}
		}
	};

	const handleDoubleClick = (e: any) => {
		const target = e.target as CanvasObject | undefined;
		if (target && '_id' in target) {
			alert(
				`Double clicked asset with ID: ${target._id} (this will open a modal for cropping in next version)`
			);
		}
	};

	onMount(() => {
		fabricCanvas = new Canvas(canvasEl, {
			preserveObjectStacking: true,
			selection: true
		});

		const updateObjectTransform = (e: ModifiedEvent<TPointerEvent> & { target: CanvasObject }) => {
			const obj = e.target;
			if (!obj || !('_id' in obj)) return;

			appState.updateTransform(obj._id, {
				scaleX: obj.scaleX,
				scaleY: obj.scaleY,
				angle: obj.angle,
				x: obj.left,
				y: obj.top
			});
		};

		fabricCanvas.on('object:modified', updateObjectTransform);
		fabricCanvas.on('mouse:dblclick', handleDoubleClick);

		resizeCanvas();
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('resize', resizeCanvas);

		onDestroy(() => {
			window.removeEventListener('resize', resizeCanvas);
			window.removeEventListener('keydown', handleKeyDown);

			fabricCanvas.off('object:modified', updateObjectTransform);
			fabricCanvas.off('mouse:dblclick', handleDoubleClick);

			fabricCanvas.dispose();
		});
	});

	$effect(() => {
		for (const obj of toRemove()) {
			fabricCanvas.remove(obj);
		}

		for (const item of toAdd()) {
			FabricImage.fromURL(item.blobURL).then((img) => {
				img.set({
					angle: item.angle || 0,
					left: item.x ?? 0,
					top: item.y ?? 0,
					scaleX: item.scaleX ?? 1,
					scaleY: item.scaleY ?? 1,
					selectable: true,
					hasControls: true,
					hasBorders: true,
					opacity: 0.8,
					_id: item.id
				});
				(item.scaleX === undefined || item.scaleY === undefined) &&
					img.scaleToWidth(canvasEl.clientWidth / 4);
				fabricCanvas.add(img);
				fabricCanvas.renderAll();
			});
		}
	});
</script>

<div class="canvas relative flex flex-col gap-2">
	<span class="pane-label">canvas</span>
	<div class="flex gap-2">
		<button onclick={() => stepsStore.setStep(2)}>
			<Aperture size={12} />create panorama
		</button>
		<button onclick={appState.clearCanvasItems}>clear selection</button>
		<button
			onclick={() => {
				alert('yet to come');
			}}
		>
			<Download size={12} /> images
		</button>
		<button
			onclick={() => {
				alert('yet to come');
			}}
		>
			<Download size={12} /> canvas
		</button>
	</div>
	<div class="w-full flex-1" bind:this={canvasContainer}>
		<canvas bind:this={canvasEl} width="800" height="500"></canvas>
	</div>
</div>

<style>
	canvas {
		border: 1px solid #ccc;
	}
</style>
