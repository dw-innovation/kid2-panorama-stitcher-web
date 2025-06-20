import Upload from '$lib/ui/Upload.svelte';
import FrameSelector from '$lib/ui/FrameSelector.svelte';
import Panorama from '$lib/ui/Panorama.svelte';

export const STEPS = [
	{
		label: 'upload',
		displayName: 'Upload',
		component: Upload
	},
	{
		label: 'frameSelector',
		displayName: 'Frame Selector',
		component: FrameSelector
	},
	{
		label: 'panorama',
		displayName: 'Panorama',
		component: Panorama
	}
] as const;
