# jakehoogstrate.com

Personal site built with [Astro](https://astro.build), Tailwind CSS, and a
Cloudflare Workers backend for a password-protected admin panel.

## Structure

```text
/
├── public/
│   └── images/blog/         # Uploaded post images (written by the admin panel)
├── src/
│   ├── content/blog/         # Blog posts (Markdown, written by the admin panel)
│   ├── content.config.ts     # Blog collection schema
│   ├── lib/                  # Auth, GitHub API client, slug/frontmatter helpers
│   ├── middleware.ts          # Session gate for /admin and /api routes
│   ├── layouts/Layout.astro
│   └── pages/
│       ├── index.astro       # About + contact
│       ├── projects.astro
│       ├── blog/              # Public blog (static, prerendered)
│       ├── admin/             # Admin panel (login, dashboard, new post)
│       └── api/                # Login/logout/posts/uploads endpoints
└── wrangler.jsonc
```

## Commands

| Command                | Action                                          |
| :---------------------- | :----------------------------------------------- |
| `npm install`            | Install dependencies                            |
| `npm run dev`             | Start local dev server at `localhost:4321`      |
| `npm run build`           | Build the site + Worker to `./dist/`             |
| `npm run preview`         | Preview the build locally                       |
| `npm run deploy`          | Build and deploy to Cloudflare Workers           |

## How posting works

There's no manual Markdown editing — log in at `/admin/login`, click **New
Post**, and fill in the title, description, date, an optional cover image, and
the Markdown body (with an "Insert image" button for inline images). On
publish, the admin backend commits the post (and any images) directly to this
GitHub repo via the GitHub API, which triggers a new Cloudflare Workers build
automatically. The live update takes about a minute.

Posts are still just Markdown files in `src/content/blog/` under the hood —
the admin panel is a convenience layer on top of git, not a database.

## Environment variables / secrets

Required, set as Cloudflare Workers secrets/vars (not committed):

| Name              | Type   | Notes                                                              |
| :----------------- | :----- | :------------------------------------------------------------------ |
| `ADMIN_PASSWORD`    | secret | The admin login password.                                          |
| `SESSION_SECRET`    | secret | Random string used to sign session cookies (`openssl rand -base64 32`). |
| `GITHUB_TOKEN`      | secret | Fine-grained GitHub PAT, Contents: Read & write, scoped to this repo. |
| `GITHUB_OWNER`      | var    | GitHub username/org that owns this repo.                           |
| `GITHUB_REPO`       | var    | This repo's name.                                                   |
| `GITHUB_BRANCH`     | var    | Defaults to `main`.                                                  |

For local development, copy these into a `.dev.vars` file (secrets) and `.env`
file (`GITHUB_OWNER`/`GITHUB_REPO`) — both are gitignored.

## Deployment

This site deploys to **Cloudflare Workers** (a Worker with static assets),
not GitHub Pages or Cloudflare Pages. Connect the GitHub repo in the
Cloudflare dashboard under Workers → your project → Settings → Builds for
automatic deploys on push, or run `npm run deploy` manually. Set the secrets
above in the Worker's environment variables before the admin panel will work.
