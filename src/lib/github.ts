export interface GithubConfig {
	token: string;
	owner: string;
	repo: string;
	branch: string;
}

export interface GithubFile {
	sha: string;
	content: string;
}

export interface GithubDirEntry {
	name: string;
	path: string;
	sha: string;
	type: 'file' | 'dir';
}

export class GithubApiError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

const API_BASE = 'https://api.github.com';

function authHeaders(token: string): HeadersInit {
	return {
		Authorization: `Bearer ${token}`,
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
		'User-Agent': 'jakehoogstrate-website-admin',
	};
}

async function githubFetch(config: GithubConfig, path: string, init?: RequestInit): Promise<Response> {
	return fetch(`${API_BASE}/repos/${config.owner}/${config.repo}${path}`, {
		...init,
		headers: { ...authHeaders(config.token), 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
	});
}

export async function getFile(config: GithubConfig, path: string): Promise<GithubFile | null> {
	const res = await githubFetch(config, `/contents/${path}?ref=${config.branch}`);
	if (res.status === 404) return null;
	if (!res.ok) throw new GithubApiError(res.status, await res.text());
	const data = (await res.json()) as { sha: string; content: string; encoding: string };
	const content = data.encoding === 'base64' ? atob(data.content.replace(/\n/g, '')) : data.content;
	return { sha: data.sha, content };
}

export async function listDir(config: GithubConfig, path: string): Promise<GithubDirEntry[]> {
	const res = await githubFetch(config, `/contents/${path}?ref=${config.branch}`);
	if (res.status === 404) return [];
	if (!res.ok) throw new GithubApiError(res.status, await res.text());
	const data = (await res.json()) as GithubDirEntry[];
	return Array.isArray(data) ? data : [];
}

export async function putFile(
	config: GithubConfig,
	path: string,
	contentBase64: string,
	message: string,
	sha?: string
): Promise<void> {
	const res = await githubFetch(config, `/contents/${path}`, {
		method: 'PUT',
		body: JSON.stringify({ message, content: contentBase64, branch: config.branch, ...(sha ? { sha } : {}) }),
	});
	if (!res.ok) throw new GithubApiError(res.status, await res.text());
}

export async function deleteFile(config: GithubConfig, path: string, sha: string, message: string): Promise<void> {
	const res = await githubFetch(config, `/contents/${path}`, {
		method: 'DELETE',
		body: JSON.stringify({ message, sha, branch: config.branch }),
	});
	if (!res.ok) throw new GithubApiError(res.status, await res.text());
}

export function base64FromBytes(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

export function base64FromText(text: string): string {
	return base64FromBytes(new TextEncoder().encode(text));
}
