# jakehoogstrate.com

Personal site built with [Astro](https://astro.build) and Tailwind CSS.

## Structure

```text
/
├── public/
│   └── CNAME              # GitHub Pages custom domain
├── src/
│   ├── content/blog/       # Blog posts (Markdown)
│   ├── content.config.ts   # Blog collection schema
│   ├── layouts/Layout.astro
│   └── pages/
│       ├── index.astro     # About
│       ├── projects.astro
│       ├── contact.astro
│       └── blog/
└── .github/workflows/deploy.yml
```

## Commands

| Command           | Action                                      |
| :----------------- | :------------------------------------------ |
| `npm install`       | Install dependencies                        |
| `npm run dev`       | Start local dev server at `localhost:4321`  |
| `npm run build`     | Build production site to `./dist/`          |
| `npm run preview`   | Preview the build locally                   |

## Adding a blog post

Add a new Markdown file to `src/content/blog/` with frontmatter:

```md
---
title: My Post
description: A short summary.
date: 2026-07-01
---

Post content goes here.
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes it to GitHub Pages. See the setup steps below to point your domain
at it.
