<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		ActiveSelection,
		Canvas,
		FabricImage,
		type FabricObject,
		type ModifiedEvent,
		type TPointerEvent
	} from 'fabric';
	import { appState } from '$lib/stores/state.svelte';
	import type { CanvasObject } from '$lib/shared/types';
	import { Aperture, Download, XIcon } from '@lucide/svelte';
	import { stepsStore } from '$lib/stores/steps.svelte';
	import Modal from './Modal.svelte';
	import JSZip from 'jszip';

	let canvasEl: HTMLCanvasElement;
	let canvasContainer: HTMLDivElement;
	let fabricCanvas: Canvas;
	let canvasItemIds = $derived(new Set(appState.canvasItems.map((item) => item.id)));
	let modal: Modal;

	let selectedItem = $state();

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

	const downloadCanvas = () => {
		if (appState.canvasItems.length === 0) return;

		const dataURL = fabricCanvas.toDataURL({
			format: 'png',
			multiplier: 2
		});

		const link = document.createElement('a');
		link.href = dataURL;
		link.download = 'canvas.png';
		link.click();
	};

	const downloadAllImages = async () => {
		if (appState.canvasItems.length === 0) return;
		const zip = new JSZip();
		const folder = zip.folder('images');
		if (!folder) return;

		for (const item of appState.canvasItems) {
			try {
				const response = await fetch(item.blobURL);
				const blob = await response.blob();
				folder.file(`${item.id}.png`, blob);
			} catch (err) {
				console.error(`Failed to fetch image for ${item.id}`, err);
			}
		}

		const zipBlob = await zip.generateAsync({ type: 'blob' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(zipBlob);
		link.download = 'images.zip';
		link.click();
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Delete' || e.key === 'Backspace') {
			const selected = fabricCanvas.getActiveObjects?.() ?? [];

			if (selected.length === 0) return;

			const idsToRemove = selected.map((obj) => (obj as CanvasObject)._id).filter(Boolean);

			if (idsToRemove.length > 0) {
				appState.removeFromCanvasItems(idsToRemove);

				fabricCanvas.discardActiveObject();
				fabricCanvas.requestRenderAll();
			}
		}
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
			e.preventDefault();

			const allObjects = fabricCanvas.getObjects().filter((obj) => obj.type === 'image');
			if (allObjects.length > 0) {
				fabricCanvas.discardActiveObject();
				const selection = new ActiveSelection(allObjects, {
					canvas: fabricCanvas
				});
				fabricCanvas.setActiveObject(selection);
				fabricCanvas.requestRenderAll();
			}
		}
	};

	const handleDoubleClick = (e: any) => {
		const target = e.target as CanvasObject | undefined;
		if (target && '_id' in target) {
			selectedItem = target._id;
			modal.toggle();
		}
	};
	const clampObjectToCanvas = (obj: FabricObject) => {
		if (!fabricCanvas || !obj) return;

		const canvasWidth = fabricCanvas.getWidth();
		const canvasHeight = fabricCanvas.getHeight();

		obj.setCoords();
		const bounds = obj.getBoundingRect();

		const overflow = {
			left: Math.min(0, bounds.left),
			right: Math.max(0, bounds.left + bounds.width - canvasWidth),
			top: Math.min(0, bounds.top),
			bottom: Math.max(0, bounds.top + bounds.height - canvasHeight)
		};

		if (overflow.left !== 0 || overflow.right !== 0) {
			obj.left = obj.left! - overflow.left - overflow.right;
		}

		if (overflow.top !== 0 || overflow.bottom !== 0) {
			obj.top = obj.top! - overflow.top - overflow.bottom;
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

		fabricCanvas.on('object:moving', (e) => {
			clampObjectToCanvas(e.target);
		});
		fabricCanvas.on('object:modified', updateObjectTransform);
		fabricCanvas.on('mouse:dblclick', handleDoubleClick);

		resizeCanvas();
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('resize', resizeCanvas);

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			window.removeEventListener('keydown', handleKeyDown);

			fabricCanvas.off('object:moving', (e) => {
				clampObjectToCanvas(e.target);
			});
			fabricCanvas.off('object:modified', updateObjectTransform);
			fabricCanvas.off('mouse:dblclick', handleDoubleClick);

			fabricCanvas.dispose();
		};
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

<Modal bind:this={modal}>
	crop box for
	{selectedItem}

	<p>feature is yet to come</p>
</Modal>

<div class="canvas relative flex flex-col gap-2">
	<span class="pane-label">canvas</span>
	<div class="flex gap-2">
		<button
			onclick={() => stepsStore.setStep(2)}
			disabled={appState.canvasItems.length < 2}
			class="button--primary"
		>
			<Aperture size={12} />create panorama
		</button>
		<button onclick={appState.clearCanvasItems}><XIcon size={12} /> clear canvas</button>
		<button onclick={downloadAllImages}>
			<Download size={12} /> images
		</button>
		<button onclick={downloadCanvas}>
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
