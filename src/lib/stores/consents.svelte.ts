type ConsentTypes = 'processing' | 'tracking';

export const createConsentState = () => {
	const consents = $state<Record<ConsentTypes, boolean>>({
		processing: false,
		tracking: false
	});

	return {
		toggle: (name: ConsentTypes, newState?: boolean) => {
			consents[name] = newState ? newState : !consents[name];
		},
		get: (name: ConsentTypes) => consents[name]
	};
};

export const consentState = createConsentState();
