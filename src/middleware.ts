import { defineMiddleware } from 'astro:middleware';
import { verifySession } from './lib/auth';
import { getSecret } from './lib/secrets';

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
	const isProtectedApi =
		pathname.startsWith('/api/posts') || pathname.startsWith('/api/uploads') || pathname === '/api/logout';

	if (!isAdminPage && !isProtectedApi) {
		return next();
	}

	const authed = await verifySession(context.request.headers.get('cookie'), getSecret('SESSION_SECRET'));

	if (!authed) {
		if (isAdminPage) {
			return context.redirect('/admin/login');
		}
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return next();
});
