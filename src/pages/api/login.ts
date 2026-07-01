import type { APIRoute } from 'astro';
import { ADMIN_PASSWORD, SESSION_SECRET } from 'astro:env/server';
import { verifyPassword, createSessionCookie } from '../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
	const form = await request.formData();
	const password = String(form.get('password') ?? '');

	const valid = await verifyPassword(password, ADMIN_PASSWORD, SESSION_SECRET);
	if (!valid) {
		return new Response(null, { status: 303, headers: { Location: '/admin/login?error=1' } });
	}

	const cookie = await createSessionCookie(SESSION_SECRET);
	return new Response(null, { status: 303, headers: { Location: '/admin', 'Set-Cookie': cookie } });
};
