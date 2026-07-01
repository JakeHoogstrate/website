import type { APIRoute } from 'astro';
import { verifyPassword, createSessionCookie } from '../../lib/auth';
import { getSecret } from '../../lib/secrets';

export const POST: APIRoute = async ({ request }) => {
	// Read secrets before any await (e.g. request.formData()) — Cloudflare's
	// per-request env binding can become unreachable after certain awaits.
	const sessionSecret = getSecret('SESSION_SECRET');
	const adminPassword = getSecret('ADMIN_PASSWORD');

	const form = await request.formData();
	const password = String(form.get('password') ?? '');

	const valid = await verifyPassword(password, adminPassword, sessionSecret);
	if (!valid) {
		return new Response(null, { status: 303, headers: { Location: '/admin/login?error=1' } });
	}

	const cookie = await createSessionCookie(sessionSecret);
	return new Response(null, { status: 303, headers: { Location: '/admin', 'Set-Cookie': cookie } });
};
