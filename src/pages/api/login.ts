import type { APIRoute } from 'astro';
import { verifyPassword, createSessionCookie } from '../../lib/auth';
import { getSecret } from '../../lib/secrets';

export const POST: APIRoute = async ({ request }) => {
	const form = await request.formData();
	const password = String(form.get('password') ?? '');
	const sessionSecret = getSecret('SESSION_SECRET');

	const valid = await verifyPassword(password, getSecret('ADMIN_PASSWORD'), sessionSecret);
	if (!valid) {
		return new Response(null, { status: 303, headers: { Location: '/admin/login?error=1' } });
	}

	const cookie = await createSessionCookie(sessionSecret);
	return new Response(null, { status: 303, headers: { Location: '/admin', 'Set-Cookie': cookie } });
};
