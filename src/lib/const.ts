import Upload from './ui/Upload.svelte';
import FrameSelector from './ui/FrameSelector.svelte';
import Result from './ui/Result.svelte';

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
		label: 'result',
		displayName: 'Panorama',

		component: Result
	}
] as const;
