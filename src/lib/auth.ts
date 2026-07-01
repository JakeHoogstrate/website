const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function hmac(secret: string, message: string): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign',
	]);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
	return new Uint8Array(signature);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

function toBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
	const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
	const binary = atob(padded);
	return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function verifyPassword(submitted: string, expected: string, secret: string): Promise<boolean> {
	const [a, b] = await Promise.all([hmac(secret, submitted), hmac(secret, expected)]);
	return constantTimeEqual(a, b);
}

export async function createSessionCookie(secret: string): Promise<string> {
	const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
	const payloadB64 = toBase64Url(encoder.encode(payload));
	const sig = await hmac(secret, payloadB64);
	const value = `${payloadB64}.${toBase64Url(sig)}`;
	return `${SESSION_COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
}

export function clearSessionCookie(): string {
	return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export async function verifySession(cookieHeader: string | null, secret: string): Promise<boolean> {
	if (!cookieHeader) return false;
	const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
	if (!match) return false;
	const [payloadB64, sigB64] = match[1].split('.');
	if (!payloadB64 || !sigB64) return false;

	const expectedSig = await hmac(secret, payloadB64);
	if (!constantTimeEqual(expectedSig, fromBase64Url(sigB64))) return false;

	try {
		const payload = JSON.parse(decoder.decode(fromBase64Url(payloadB64)));
		return typeof payload.exp === 'number' && payload.exp > Date.now();
	} catch {
		return false;
	}
}
