import { STEPS } from '../shared/const';
import { modalState } from './modals.svelte';
import { appState } from './state.svelte';

export const createStepsStore = () => {
	const state = $state<{
		currentStep: number;
	}>({
		currentStep: 0
	});

	return {
		get currentStep() {
			return state.currentStep;
		},
		nextStep: () => {
			if (state.currentStep + 1 < STEPS.length) state.currentStep++;
		},
		prevStep: () => {
			if (state.currentStep !== 0) state.currentStep--;
		},
		setStep: async (index: number) => {
			if (index < 0 || index >= STEPS.length) return;

			if (index === STEPS.length - 1 && appState.canvasItems.length === 0) return;

			if (index === 2 && !appState.getConsent('processing')) {
				const result = await modalState.awaitResult('processing');
				if (!result) return;
			}
			state.currentStep = index;
		}
	};
};

export const stepsStore = createStepsStore();
