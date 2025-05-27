import Upload from './ui/Upload.svelte';
import FrameSelector from './ui/FrameSelector.svelte';
import Result from './ui/Result.svelte';

export const STEPS = [
	{
		label: 'upload',
		component: Upload
	},
	{
		label: 'frameSelector',
		component: FrameSelector
	},
	{
		label: 'result',
		component: Result
	}
];
