import type { APIRoute } from 'astro';
import { GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } from 'astro:env/server';
import { putFile, base64FromBytes, GithubApiError, type GithubConfig } from '../../lib/github';
import { json } from '../../lib/response';
import { getSecret } from '../../lib/secrets';

function githubConfig(): GithubConfig {
	return { token: getSecret('GITHUB_TOKEN'), owner: GITHUB_OWNER, repo: GITHUB_REPO, branch: GITHUB_BRANCH };
}

function sanitizeFilename(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/-{2,}/g, '-');
}

export const POST: APIRoute = async ({ request }) => {
	const form = await request.formData();
	const draftId = String(form.get('draftId') ?? '').trim();
	const file = form.get('file');

	if (!draftId || !/^[a-f0-9-]{8,40}$/i.test(draftId)) {
		return json({ error: 'Missing or invalid draft id.' }, 400);
	}
	if (!(file instanceof File)) {
		return json({ error: 'Missing file.' }, 400);
	}
	if (!file.type.startsWith('image/')) {
		return json({ error: 'Only image uploads are allowed.' }, 400);
	}

	const bytes = new Uint8Array(await file.arrayBuffer());
	const filename = sanitizeFilename(file.name) || 'image';
	const path = `public/images/blog/${draftId}/${Date.now()}-${filename}`;

	try {
		await putFile(githubConfig(), path, base64FromBytes(bytes), `Upload image for draft ${draftId}`);
		return json({ path: `/${path.replace(/^public\//, '')}` }, 200);
	} catch (error) {
		if (error instanceof GithubApiError) {
			return json({ error: `GitHub API error (${error.status}): ${error.message}` }, 502);
		}
		return json({ error: 'Unexpected error uploading the image.' }, 500);
	}
};
