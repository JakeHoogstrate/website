import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request }) => {
	const cfEnv = env as unknown as Record<string, string | undefined>;
	const sessionSecret = cfEnv.SESSION_SECRET;
	const adminPassword = cfEnv.ADMIN_PASSWORD;
	if (!sessionSecret || !adminPassword) {
		return new Response(JSON.stringify({ error: 'Server misconfigured: missing secrets.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const form = await request.formData();
	const password = String(form.get('password') ?? '');

	return new Response(JSON.stringify({ ok: true, gotPassword: password.length > 0 }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
