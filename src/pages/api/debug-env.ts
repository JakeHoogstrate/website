import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async () => {
	const keys = ['ADMIN_PASSWORD', 'SESSION_SECRET', 'GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH'];
	const presence: Record<string, boolean> = {};
	for (const key of keys) {
		presence[key] = (env as unknown as Record<string, unknown>)[key] !== undefined;
	}
	return new Response(JSON.stringify(presence), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
