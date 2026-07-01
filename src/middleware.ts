import { defineMiddleware } from 'astro:middleware';
import { SESSION_SECRET } from 'astro:env/server';
import { verifySession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
	const isProtectedApi =
		pathname.startsWith('/api/posts') || pathname.startsWith('/api/uploads') || pathname === '/api/logout';

	if (!isAdminPage && !isProtectedApi) {
		return next();
	}

	const authed = await verifySession(context.request.headers.get('cookie'), SESSION_SECRET);

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
