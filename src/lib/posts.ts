import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n';

export type Post = CollectionEntry<'blog'>;

export function postSlug(id: string): string {
  const withoutExt = id.replace(/\.mdx?$/, '');
  const parts = withoutExt.split('/');
  if (parts[0] === 'en' || parts[0] === 'zh') parts.shift();
  const slug = parts.join('/');
  if (!slug || slug.includes('/')) {
    throw new Error(`Post ${id} must use a single slug segment, got "${slug}".`);
  }
  return slug;
}

export function postPath(lang: Lang, slug: string): string {
  return lang === 'zh' ? `/zh/posts/${slug}/` : `/posts/${slug}/`;
}

async function loadBlog(): Promise<Post[]> {
  const entries = await getCollection('blog');
  const translationKeys = new Map<string, string>();
  const slugs = new Map<string, string>();

  for (const entry of entries) {
    const folder = entry.id.split('/')[0];
    if (folder !== entry.data.lang) {
      throw new Error(
        `${entry.id}: lang is "${entry.data.lang}" but the file is in "${folder}/".`,
      );
    }

    const slug = postSlug(entry.id);
    const slugKey = `${entry.data.lang}:${slug}`;
    const existingSlug = slugs.get(slugKey);
    if (existingSlug) {
      throw new Error(`Duplicate slug "${slug}" in ${entry.data.lang}: ${existingSlug} and ${entry.id}.`);
    }
    slugs.set(slugKey, entry.id);

    const translationKey = `${entry.data.lang}:${entry.data.translationKey}`;
    const existingKey = translationKeys.get(translationKey);
    if (existingKey) {
      throw new Error(
        `Duplicate translationKey "${entry.data.translationKey}" in ${entry.data.lang}: ${existingKey} and ${entry.id}.`,
      );
    }
    translationKeys.set(translationKey, entry.id);
  }

  return entries;
}

export async function getPosts(lang: Lang, options?: { includeDrafts?: boolean }): Promise<Post[]> {
  const includeDrafts = options?.includeDrafts ?? !import.meta.env.PROD;
  const entries = await loadBlog();
  return entries
    .filter((entry) => entry.data.lang === lang && (includeDrafts || !entry.data.draft))
    .sort(
      (a, b) =>
        b.data.date.getTime() - a.data.date.getTime() ||
        a.data.title.localeCompare(b.data.title),
    );
}

export async function findTranslation(entry: Post): Promise<Post | null> {
  const other: Lang = entry.data.lang === 'en' ? 'zh' : 'en';
  const posts = await getPosts(other);
  return posts.find((post) => post.data.translationKey === entry.data.translationKey) ?? null;
}

export async function pathsFor(lang: Lang): Promise<{ params: { slug: string }; props: { id: string } }[]> {
  const posts = await getPosts(lang);
  return posts.map((post) => ({
    params: { slug: postSlug(post.id) },
    props: { id: post.id },
  }));
}
