import type { APIRoute } from 'astro';
import { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } from 'astro:env/server';
import { getFile, deleteFile, GithubApiError, type GithubConfig } from '../../../lib/github';
import { json } from '../../../lib/response';

function githubConfig(): GithubConfig {
	return { token: GITHUB_TOKEN, owner: GITHUB_OWNER, repo: GITHUB_REPO, branch: GITHUB_BRANCH };
}

export const DELETE: APIRoute = async ({ params }) => {
	const slug = params.slug;
	if (!slug) return json({ error: 'Missing slug.' }, 400);

	const config = githubConfig();
	try {
		const path = `src/content/blog/${slug}.md`;
		const file = await getFile(config, path);
		if (!file) return json({ error: 'Post not found.' }, 404);

		await deleteFile(config, path, file.sha, `Delete post: ${slug}`);
		return json({ ok: true }, 200);
	} catch (error) {
		if (error instanceof GithubApiError) {
			return json({ error: `GitHub API error (${error.status}): ${error.message}` }, 502);
		}
		return json({ error: 'Unexpected error deleting the post.' }, 500);
	}
};
