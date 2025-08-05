<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		ActiveSelection,
		Canvas,
		FabricImage,
		Point,
		type FabricObject,
		type ModifiedEvent,
		type TPointerEvent
	} from 'fabric';
	import { appState } from '$lib/stores/state.svelte';
	import type { CanvasObject } from '$lib/shared/types';
	import { Aperture, Download, XIcon, ZoomIn, ZoomOut, RotateCcw } from '@lucide/svelte';
	import { stepsStore } from '$lib/stores/steps.svelte';
	import Modal from './Modal.svelte';
	import JSZip from 'jszip';

	let canvasEl: HTMLCanvasElement;
	let canvasContainer: HTMLDivElement;
	let fabricCanvas: Canvas;
	let canvasItemIds = $derived(new Set(appState.canvasItems.map((item) => item.id)));
	let modal: Modal;

	let selectedItem = $state();
	let zoomLevel = $state(1);
	let isPanning = $state(false);
	let lastPanPoint = $state<Point | null>(null);
	let isAltPressed = $state(false);

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

		appState.trackAction('Download', 'download_canvas', 'canvas_png_download');
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

		appState.trackAction('Download', 'download_images_zip', 'images_zip_download');
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Alt' || e.altKey) {
			isAltPressed = true;
			if (fabricCanvas) {
				fabricCanvas.defaultCursor = 'grab';
			}
		}
		if (e.key === 'Delete' || e.key === 'Backspace') {
			const selected = fabricCanvas.getActiveObjects?.() ?? [];

			if (selected.length === 0) return;

			const idsToRemove = selected.map((obj) => (obj as CanvasObject)._id).filter(Boolean);

			if (idsToRemove.length > 0) {
				appState.removeFromCanvasItems(idsToRemove);
				appState.trackAction('Canvas', 'delete_objects', 'keyboard_delete');

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

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.key === 'Alt' || !e.altKey) {
			isAltPressed = false;
			if (fabricCanvas) {
				fabricCanvas.defaultCursor = 'default';
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

		// Add mouse wheel zoom
		fabricCanvas.on('mouse:wheel', (opt) => {
			const delta = opt.e.deltaY;
			let zoom = fabricCanvas.getZoom();
			zoom *= 0.999 ** delta;
			if (zoom > 20) zoom = 20;
			if (zoom < 0.01) zoom = 0.01;
			fabricCanvas.zoomToPoint(new Point(opt.e.offsetX, opt.e.offsetY), zoom);
			zoomLevel = zoom;
			opt.e.preventDefault();
			opt.e.stopPropagation();
		});

		// Add pan functionality
		fabricCanvas.on('mouse:down', (opt) => {
			const evt = opt.e as MouseEvent;
			if (evt.altKey === true) {
				// Always pan when Alt is held, regardless of target
				isPanning = true;
				fabricCanvas.selection = false;
				fabricCanvas.defaultCursor = 'grabbing';
				lastPanPoint = new Point(evt.clientX, evt.clientY);
				// Prevent selection of objects when Alt is held
				if (opt.target) {
					fabricCanvas.discardActiveObject();
				}
				evt.preventDefault();
				evt.stopPropagation();
			} else if (zoomLevel > 1 && !opt.target) {
				// Pan when zoomed and clicking empty area
				isPanning = true;
				fabricCanvas.selection = false;
				lastPanPoint = new Point(evt.clientX, evt.clientY);
			}
		});

		fabricCanvas.on('mouse:move', (opt) => {
			if (isPanning && lastPanPoint) {
				const evt = opt.e as MouseEvent;
				const vpt = fabricCanvas.viewportTransform!;
				vpt[4] += evt.clientX - lastPanPoint.x;
				vpt[5] += evt.clientY - lastPanPoint.y;
				fabricCanvas.requestRenderAll();
				lastPanPoint = new Point(evt.clientX, evt.clientY);
			}
		});

		fabricCanvas.on('mouse:up', () => {
			if (isPanning) {
				fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform!);
				isPanning = false;
				fabricCanvas.selection = true;
				fabricCanvas.defaultCursor = isAltPressed ? 'grab' : 'default';
			}
		});

		// Prevent selection when Alt key is held
		fabricCanvas.on('selection:created', (opt) => {
			const evt = opt.e as MouseEvent | undefined;
			if (evt?.altKey) {
				fabricCanvas.discardActiveObject();
				fabricCanvas.renderAll();
			}
		});

		fabricCanvas.on('selection:updated', (opt) => {
			const evt = opt.e as MouseEvent | undefined;
			if (evt?.altKey) {
				fabricCanvas.discardActiveObject();
				fabricCanvas.renderAll();
			}
		});

		resizeCanvas();
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('resize', resizeCanvas);

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);

			fabricCanvas.off('object:moving');
			fabricCanvas.off('object:modified', updateObjectTransform);
			fabricCanvas.off('mouse:dblclick', handleDoubleClick);
			fabricCanvas.off('mouse:wheel');
			fabricCanvas.off('mouse:down');
			fabricCanvas.off('mouse:move');
			fabricCanvas.off('mouse:up');
			fabricCanvas.off('selection:created');
			fabricCanvas.off('selection:updated');

			fabricCanvas.dispose();
		};
	});

	// Zoom functions
	const zoomIn = () => {
		let zoom = fabricCanvas.getZoom();
		zoom = zoom * 1.1;
		if (zoom > 20) zoom = 20;
		fabricCanvas.setZoom(zoom);
		zoomLevel = zoom;
	};

	const zoomOut = () => {
		let zoom = fabricCanvas.getZoom();
		zoom = zoom / 1.1;
		if (zoom < 0.01) zoom = 0.01;
		fabricCanvas.setZoom(zoom);
		zoomLevel = zoom;
	};

	const resetZoom = () => {
		fabricCanvas.setZoom(1);
		fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		zoomLevel = 1;
	};

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

<div class="canvas relative flex flex-col">
	<span class="pane-label">canvas</span>
	<div class="flex w-full justify-between p-2 pb-0">
		<div class="flex flex-wrap gap-2">
			<button
				onclick={() => stepsStore.setStep(2)}
				disabled={appState.canvasItems.length < 2}
				class="button--primary"
			>
				<Aperture size={12} />create panorama
			</button>
			<button onclick={appState.clearCanvasItems} class="bg-red-300 hover:bg-red-200!">
				<XIcon size={12} /> clear canvas</button
			>
			<button onclick={downloadAllImages}>
				<Download size={12} /> images
			</button>
			<button onclick={downloadCanvas}>
				<Download size={12} /> canvas
			</button>
		</div>
		<!-- Zoom controls -->
		<div class="flex items-center gap-2">
			<button onclick={zoomIn} title="Zoom In">
				<ZoomIn size={12} />
			</button>
			<button onclick={zoomOut} title="Zoom Out">
				<ZoomOut size={12} />
			</button>
			<button onclick={resetZoom} title="Reset Zoom">
				<RotateCcw size={12} />
			</button>
			<span class="min-w-12 rounded bg-gray-100 px-2 py-1 text-center text-xs">
				{Math.round(zoomLevel * 100)}%
			</span>
		</div>
	</div>

	{#if zoomLevel > 1}
		<div class="text-xs text-gray-600 italic">
			💡 Click and drag empty areas to pan, or hold Alt (Option on Mac) + drag
		</div>
	{/if}
	<div class="w-full flex-1 p-4 pt-0" bind:this={canvasContainer}>
		<canvas bind:this={canvasEl} width="800" height="500"></canvas>
	</div>
</div>

<style>
	canvas {
		border: 1px solid #ccc;
	}
</style>
