import type { ModalType } from './types';
import Privacy from './ui/Modals/Privacy.svelte';

export const createState = () => {
	const state = $state<ModalType[]>([{ name: 'privacy', component: Privacy }]);

	return {
		getModal(name: string): ModalType | undefined {
			return state.find((m) => m.name === name);
		}
	};
};

export const modalsState = createState();
