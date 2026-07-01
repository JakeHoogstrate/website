import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

function checkEnv() {
	const keys = ['ADMIN_PASSWORD', 'SESSION_SECRET', 'GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH'];
	const presence: Record<string, boolean> = {};
	for (const key of keys) {
		presence[key] = (env as unknown as Record<string, unknown>)[key] !== undefined;
	}
	return presence;
}

export const GET: APIRoute = async () => {
	return new Response(JSON.stringify({ method: 'GET', ...checkEnv() }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};

export const POST: APIRoute = async () => {
	return new Response(JSON.stringify({ method: 'POST', ...checkEnv() }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
