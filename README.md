# Shem Yu

Personal site for [shemyu.github.io](https://shemyu.github.io). English is the default locale at `/`. Traditional Chinese lives at `/zh/`. The site is a static [Astro](https://astro.build/) build, published with GitHub Actions.

## Preview locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:4321. Draft posts render here, with a draft banner.

```bash
npm run build
npm run preview
```

`npm run build` writes `dist/` and checks that draft posts stayed out of the pages, sitemap, and feeds.

## Add a post

Create one Markdown file per language:

- English: `src/content/blog/en/<slug>.md`
- Traditional Chinese: `src/content/blog/zh/<slug>.md`

`<slug>` is a single path segment, for example `serving-notes`. The folder must match `lang`.

```yaml
---
title: "Post title"
date: "2026-10-02"
description: "One or two sentences."
tags:
  - serving
lang: en
translationKey: serving-notes
canonical: ""
draft: true
---
```

Use the same `translationKey` on the English and Chinese files. That is what links the two versions. The slugs may differ. `src/content/blog/en/example-draft.md` and `src/content/blog/zh/example-draft.md` show every field. They are drafts, not articles. Delete them when you no longer need the sample.

## Drafts

`draft: true` keeps a post out of the production build. It is not a page, not listed on Home or Posts, and not included in RSS, Atom, or the sitemap. `npm run dev` still renders it so you can preview. Set `draft: false`, or remove the field, when the post should go live.

## Cross-posting

Publish here first. When you also post on Medium or LinkedIn, set the canonical URL **on Medium or LinkedIn** to this site:

- English: `https://shemyu.github.io/posts/<slug>/`
- Traditional Chinese: `https://shemyu.github.io/zh/posts/<slug>/`

Leave `canonical` empty in front matter so this site points at itself. Set `canonical` to an absolute URL only when this copy should defer to a different original.

## Deploy

Pushes to `main` build the site and deploy it with GitHub Actions. Once, in the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
