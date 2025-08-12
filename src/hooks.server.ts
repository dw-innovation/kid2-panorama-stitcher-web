import type { Handle } from '@sveltejs/kit';
import { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } from '$env/static/private';

const BASIC_AUTH_ENABLED = false; // Disable in development mode
const USERNAME = BASIC_AUTH_USERNAME || 'admin';
const PASSWORD = BASIC_AUTH_PASSWORD || 'password';

export const handle: Handle = async ({ event, resolve }) => {
	// Skip auth in development mode
	if (!BASIC_AUTH_ENABLED) {
		return resolve(event);
	}

	const authorization = event.request.headers.get('authorization');

	if (!authorization) {
		return new Response('Unauthorized', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Protected Area"'
			}
		});
	}

	const credentials = authorization.split(' ')[1];
	if (!credentials) {
		return new Response('Unauthorized', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Protected Area"'
			}
		});
	}

	const [username, password] = atob(credentials).split(':');

	if (username !== USERNAME || password !== PASSWORD) {
		return new Response('Unauthorized', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Protected Area"'
			}
		});
	}

	return resolve(event);
};
