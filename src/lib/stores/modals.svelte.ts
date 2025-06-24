type ModalInstance = {
	name: string;
	toggle: (open?: boolean) => void;
	awaitResult?: () => Promise<boolean>;
};

export const createModalState = () => {
	const modals = $state<Map<string, ModalInstance>>(new Map());

	return {
		register: (name: string, instance: ModalInstance) => {
			modals.set(name, instance);
		},
		unregister: (name: string) => {
			modals.delete(name);
		},
		get: (name: string) => modals.get(name),
		toggle: (name: string, open?: boolean) => {
			const modal = modals.get(name);
			modal?.toggle(open);
		},
		awaitResult: async (name: string) => {
			const modal = modals.get(name);
			return modal?.awaitResult?.();
		}
	};
};

export const modalState = createModalState();
