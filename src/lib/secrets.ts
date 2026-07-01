import { env } from 'cloudflare:workers';

type SecretName = 'ADMIN_PASSWORD' | 'SESSION_SECRET' | 'GITHUB_TOKEN';

export function getSecret(name: SecretName): string {
	const value = (env as unknown as Record<string, string | undefined>)[name];
	if (!value) throw new Error(`Missing required secret: ${name}`);
	return value;
}
