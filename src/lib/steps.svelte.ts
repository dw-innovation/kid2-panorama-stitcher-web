import { STEPS } from './const';

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
		setStep: (index: number) => {
			if (index >= 0 && index < STEPS.length) state.currentStep = index;
		}
	};
};

export const stepsStore = createStepsStore();
