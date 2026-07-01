import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
	const localsKeys = Object.keys(context.locals ?? {});
	const runtimeKeys = (context.locals as Record<string, unknown>)?.runtime
		? Object.keys((context.locals as Record<string, Record<string, unknown>>).runtime)
		: null;
	let runtimeEnvKeys: string[] | null = null;
	const runtime = (context.locals as Record<string, unknown>)?.runtime as Record<string, unknown> | undefined;
	if (runtime && typeof runtime === 'object' && 'env' in runtime) {
		runtimeEnvKeys = Object.keys(runtime.env as Record<string, unknown>);
	}
	return new Response(JSON.stringify({ localsKeys, runtimeKeys, runtimeEnvKeys }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
