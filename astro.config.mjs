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
      ADMIN_PASSWORD: envField.string({ context: 'server', access: 'secret' }),
      SESSION_SECRET: envField.string({ context: 'server', access: 'secret' }),
      GITHUB_TOKEN: envField.string({ context: 'server', access: 'secret' }),
      GITHUB_OWNER: envField.string({ context: 'server', access: 'public' }),
      GITHUB_REPO: envField.string({ context: 'server', access: 'public' }),
      GITHUB_BRANCH: envField.string({ context: 'server', access: 'public', default: 'main' }),
    }
  }
});