import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyPassword, createSessionCookie } from '../../lib/auth';

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

	const valid = await verifyPassword(password, adminPassword, sessionSecret);
	if (!valid) {
		return new Response(null, { status: 303, headers: { Location: '/admin/login?error=1' } });
	}

	const cookie = await createSessionCookie(sessionSecret);
	return new Response(null, { status: 303, headers: { Location: '/admin', 'Set-Cookie': cookie } });
};
