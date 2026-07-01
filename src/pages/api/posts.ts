import type { APIRoute } from 'astro';
import { GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } from 'astro:env/server';
import { getFile, putFile, base64FromText, GithubApiError, type GithubConfig } from '../../lib/github';
import { slugify } from '../../lib/slug';
import { json } from '../../lib/response';
import { getSecret } from '../../lib/secrets';

function githubConfig(): GithubConfig {
	return { token: getSecret('GITHUB_TOKEN'), owner: GITHUB_OWNER, repo: GITHUB_REPO, branch: GITHUB_BRANCH };
}

function yamlString(value: string): string {
	return JSON.stringify(value);
}

export const POST: APIRoute = async ({ request }) => {
	const form = await request.formData();
	const title = String(form.get('title') ?? '').trim();
	const description = String(form.get('description') ?? '').trim();
	const dateStr = String(form.get('date') ?? '').trim() || new Date().toISOString().slice(0, 10);
	const draft = form.get('draft') === 'on';
	const body = String(form.get('body') ?? '').trim();
	const cover = String(form.get('cover') ?? '').trim();

	if (!title || !description || !body) {
		return json({ error: 'Title, description, and body are required.' }, 400);
	}

	const baseSlug = slugify(title);
	if (!baseSlug) {
		return json({ error: 'Could not generate a URL slug from that title.' }, 400);
	}

	const config = githubConfig();

	try {
		let slug = baseSlug;
		let suffix = 2;
		while (await getFile(config, `src/content/blog/${slug}.md`)) {
			slug = `${baseSlug}-${suffix}`;
			suffix += 1;
		}

		const frontmatterLines = [
			'---',
			`title: ${yamlString(title)}`,
			`description: ${yamlString(description)}`,
			`date: ${dateStr}`,
			`draft: ${draft}`,
		];
		if (cover) frontmatterLines.push(`cover: ${yamlString(cover)}`);
		frontmatterLines.push('---', '', body, '');

		const markdown = frontmatterLines.join('\n');
		await putFile(config, `src/content/blog/${slug}.md`, base64FromText(markdown), `Add post: ${title}`);

		return json({ slug, url: `/blog/${slug}` }, 200);
	} catch (error) {
		if (error instanceof GithubApiError) {
			return json({ error: `GitHub API error (${error.status}): ${error.message}` }, 502);
		}
		return json({ error: 'Unexpected error creating the post.' }, 500);
	}
};
