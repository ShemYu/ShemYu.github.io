import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { ui, type Lang } from '../i18n';
import { getPosts, postPath, postSlug } from './posts';
import { absoluteUrl } from './site';

const EMPTY_FEED_UPDATED = '2026-10-02T00:00:00.000Z';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function rssResponse(lang: Lang, context: APIContext): Promise<Response> {
  if (!context.site) throw new Error('Set site in astro.config.mjs before building feeds.');
  const posts = await getPosts(lang, { includeDrafts: false });
  return rss({
    title: ui[lang].feedTitle,
    description: ui[lang].description,
    site: context.site,
    trailingSlash: true,
    customData: `<language>${lang === 'zh' ? 'zh-Hant' : 'en-US'}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postPath(lang, postSlug(post.id)),
      categories: post.data.tags,
    })),
  });
}

export async function atomResponse(lang: Lang): Promise<Response> {
  const posts = await getPosts(lang, { includeDrafts: false });
  const home = lang === 'zh' ? '/zh/' : '/';
  const self = lang === 'zh' ? '/zh/atom.xml' : '/atom.xml';
  const updated = posts[0]?.data.date.toISOString() ?? EMPTY_FEED_UPDATED;
  const entries = posts
    .map((post) => {
      const href = absoluteUrl(postPath(lang, postSlug(post.id)));
      return `<entry>
  <title>${escapeXml(post.data.title)}</title>
  <link href="${href}" rel="alternate"/>
  <id>${href}</id>
  <updated>${post.data.date.toISOString()}</updated>
  <summary>${escapeXml(post.data.description)}</summary>
</entry>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(ui[lang].feedTitle)}</title>
  <subtitle>${escapeXml(ui[lang].description)}</subtitle>
  <link href="${absoluteUrl(self)}" rel="self"/>
  <link href="${absoluteUrl(home)}" rel="alternate"/>
  <id>${absoluteUrl(home)}</id>
  <updated>${updated}</updated>
  <author><name>Shem Yu</name></author>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
