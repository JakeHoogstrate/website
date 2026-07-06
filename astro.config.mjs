// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://jakehoogstrate.com',
  output: 'server',

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: cloudflare(),

  env: {
    schema: {
      // These are read as build-time constants (not true runtime secrets) —
      // see README for why. All are context:'server' so never bundled to
      // the client, but their values are baked into the server code.
      ADMIN_PASSWORD: envField.string({ context: 'server', access: 'public' }),
      SESSION_SECRET: envField.string({ context: 'server', access: 'public' }),
      GITHUB_TOKEN: envField.string({ context: 'server', access: 'public' }),
      GITHUB_OWNER: envField.string({ context: 'server', access: 'public' }),
      GITHUB_REPO: envField.string({ context: 'server', access: 'public' }),
      GITHUB_BRANCH: envField.string({ context: 'server', access: 'public', default: 'main' }),
    }
  }
});