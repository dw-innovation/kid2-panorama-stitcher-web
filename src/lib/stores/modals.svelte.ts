type ModalInstance = {
	name: string;
	toggle: (open?: boolean) => void;
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
		}
	};
};

export const modalState = createModalState();
