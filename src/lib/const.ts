import Upload from './ui/Upload.svelte';
import FrameSelector from './ui/FrameSelector.svelte';
import Panorama from './ui/Panorama.svelte';

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
