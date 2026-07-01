import { defineMiddleware } from 'astro:middleware';
import { verifySession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
	const isProtectedApi =
		pathname.startsWith('/api/posts') || pathname.startsWith('/api/uploads') || pathname === '/api/logout';

	if (!isAdminPage && !isProtectedApi) {
		return next();
	}

	// Imported lazily (not at module top level) so this module can be evaluated
	// at Worker cold start without eagerly reading secrets before Cloudflare's
	// adapter has wired up the per-request environment.
	const { SESSION_SECRET } = await import('astro:env/server');

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
