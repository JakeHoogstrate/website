export interface Frontmatter {
	title: string;
	description: string;
	date: string;
	draft: boolean;
	cover?: string;
}

export function parseFrontmatter(raw: string): Frontmatter | null {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return null;

	const data: Record<string, string> = {};
	for (const line of match[1].split(/\r?\n/)) {
		const idx = line.indexOf(':');
		if (idx === -1) continue;
		const key = line.slice(0, idx).trim();
		let value = line.slice(idx + 1).trim();
		if (value.startsWith('"') && value.endsWith('"')) {
			try {
				value = JSON.parse(value);
			} catch {
				// leave as-is if it isn't valid JSON-quoted text
			}
		}
		data[key] = value;
	}

	if (!data.title || !data.description || !data.date) return null;

	return {
		title: data.title,
		description: data.description,
		date: data.date,
		draft: data.draft === 'true',
		cover: data.cover || undefined,
	};
}
