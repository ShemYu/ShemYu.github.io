import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = 'https://shemyu.github.io';

export default defineConfig({
  site,
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.endsWith('/rss.xml') &&
        !page.endsWith('/atom.xml') &&
        !page.endsWith('/404.html'),
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          zh: 'zh-Hant',
        },
      },
    }),
  ],
});
