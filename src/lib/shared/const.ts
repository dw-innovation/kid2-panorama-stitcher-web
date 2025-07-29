import FrameSelector from '$lib/ui/FrameSelector.svelte';
import Panorama from '$lib/ui/Panorama.svelte';

export const STEPS = [
	{
		label: 'frameSelector',
		displayName: 'Select',
		component: FrameSelector
	},
	{
		label: 'panorama',
		displayName: 'Stitch',
		component: Panorama
	}
] as const;
