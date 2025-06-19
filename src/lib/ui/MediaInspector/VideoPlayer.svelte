<script lang="ts">
	import type { MediaItem } from '$lib/types';
	import {
		ChevronFirst,
		ChevronLast,
		FastForward,
		Pause,
		Play,
		Rewind,
		TimerReset
	} from '@lucide/svelte';
	import { onDestroy, onMount } from 'svelte';
	import { VolumeX, Volume2 } from '@lucide/svelte';
	import { appState } from '$lib/state.svelte';

	let {
		mediaItem,
		videoElement = $bindable()
	}: { mediaItem: MediaItem; videoElement: HTMLVideoElement | undefined } = $props();

	let isPlaying = $state(false);
	let currentTime = $state(mediaItem.currentTime ?? 0);
	let duration = $state(0);
	let playbackRate = $state(1);
	let isMuted = $state(false);

	const formatTime = (t: number) => {
		const minutes = Math.floor(t / 60);
		const seconds = Math.floor(t % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	const togglePlay = () => {
		if (!videoElement) return;
		if (videoElement.paused) {
			videoElement.play();
			isPlaying = true;
		} else {
			videoElement.pause();
			isPlaying = false;
		}
	};

	const rewind = () => {
		if (!videoElement) return;
		videoElement.currentTime = Math.max(0, videoElement.currentTime - 5);
	};

	const forward = () => {
		if (!videoElement) return;
		videoElement.currentTime = Math.min(duration, videoElement.currentTime + 5);
	};

	const onTimeUpdate = () => {
		if (!videoElement) return;
		currentTime = videoElement.currentTime;
	};

	const onLoadedMetadata = () => {
		if (!videoElement) return;
		duration = videoElement.duration;
	};

	const onSliderInput = (e: Event) => {
		if (!videoElement) return;
		const val = parseFloat((e.target as HTMLInputElement).value);
		videoElement.currentTime = val;
	};

	const onSpeedChange = (e: Event) => {
		const rate = parseFloat((e.target as HTMLSelectElement).value);
		playbackRate = rate;
		if (videoElement && videoElement.playbackRate !== rate) {
			videoElement.playbackRate = rate;
		}
	};

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.code === 'Space' || event.key === ' ') {
			event.preventDefault();
			togglePlay();
		}

		if (event.code === 'ArrowLeft') {
			stepBackward();
		}

		if (event.code === 'ArrowRight') {
			stepForward();
		}

		if (event.key === 'm' || event.key === 'M') {
			toggleMute();
		}
	};

	const toggleMute = () => {
		if (videoElement) {
			videoElement.muted = !videoElement.muted;
			isMuted = videoElement.muted;
		}
	};

	const stepForward = () => {
		if (!videoElement) return;
		const fps = 25;
		videoElement.currentTime = Math.min(duration, videoElement.currentTime + 1 / fps);
	};

	const stepBackward = () => {
		if (!videoElement) return;
		const fps = 25;
		videoElement.currentTime = Math.max(0, videoElement.currentTime - 1 / fps);
	};

	onMount(() => {
		window.addEventListener('keydown', onKeyDown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', onKeyDown);
	});

	let previousBlobURL: string | null = null;

	$effect(() => {
		if (!videoElement || !mediaItem?.blobURL) return;

		if (mediaItem.blobURL !== previousBlobURL) {
			previousBlobURL = mediaItem.blobURL;

			videoElement.pause();
			videoElement.src = mediaItem.blobURL;
			videoElement.load();

			videoElement.currentTime = mediaItem.currentTime ?? 0;

			isPlaying = false;
			currentTime = mediaItem.currentTime ?? 0;
			duration = 0;
		}
	});

	$effect(() => {
		appState.updatePlaybackTime(mediaItem.id, currentTime);
	});
</script>

<div class="controls flex h-full w-full flex-col overflow-hidden">
	<div class="flex flex-wrap items-center justify-center gap-2 py-2">
		<button onclick={stepBackward} title="Previous Frame">
			<ChevronFirst size={16} />
		</button>

		<button onclick={rewind}>
			<Rewind size={16} />
		</button>

		<button onclick={togglePlay}>
			{#if isPlaying}
				<Pause size={16} />
			{:else}
				<Play size={16} />
			{/if}
		</button>

		<button onclick={forward}>
			<FastForward size={16} />
		</button>

		<button onclick={stepForward} title="Next Frame">
			<ChevronLast size={16} />
		</button>
		<input
			type="range"
			min="0"
			max={duration}
			step="0.1"
			value={currentTime}
			oninput={onSliderInput}
			class="h-1 flex-1 accent-blue-500 outline-0"
		/>

		<div class="mt-1 text-xs text-gray-600 tabular-nums">
			{formatTime(currentTime)} / {formatTime(duration)}
		</div>

		<button onclick={toggleMute} title="Mute / Unmute">
			{#if isMuted}
				<VolumeX size={16} />
			{:else}
				<Volume2 size={16} />
			{/if}
		</button>

		<TimerReset size={16} />

		<select
			onchange={onSpeedChange}
			value={String(playbackRate)}
			class="rounded border px-1 py-0.5 text-sm"
		>
			<option value="0.25">0.25x</option>
			<option value="0.5">0.5x</option>
			<option value="1">1x</option>
			<option value="1.5">1.5x</option>
			<option value="2">2x</option>
		</select>
	</div>

	<div class="flex min-h-0 flex-1 items-center justify-center">
		<video
			bind:this={videoElement}
			ontimeupdate={onTimeUpdate}
			onloadedmetadata={onLoadedMetadata}
			class="max-h-full max-w-full object-contain"
		>
			<track kind="captions" />
			<source src={mediaItem.blobURL} />
			Your browser does not support the video tag.
		</video>
	</div>
</div>

<style lang="postcss">
	@reference "$src/app.css";

	.controls button {
		@apply px-1;
	}
</style>
