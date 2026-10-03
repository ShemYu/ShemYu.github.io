import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const forbidden = [
  'Example draft',
  '範例草稿',
  'example-draft',
  'Front-matter sample',
  '前置資料範例',
  'not a real article',
  '並不是真正的文章',
  'Cookpad',
  'Cathay',
  'Wisers',
  'agent platform',
];

const requiredPages = [
  'index.html',
  'about/index.html',
  'posts/index.html',
  'zh/index.html',
  'zh/about/index.html',
  'zh/posts/index.html',
  'rss.xml',
  'atom.xml',
  'zh/rss.xml',
  'zh/atom.xml',
  'robots.txt',
  '404.html',
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function fail(message) {
  console.error(`check-dist: ${message}`);
  process.exitCode = 1;
}

const distStat = await stat(root).catch(() => null);
if (!distStat?.isDirectory()) {
  console.error('check-dist: dist/ is missing. Run astro build first.');
  process.exit(1);
}

for (const relative of requiredPages) {
  const full = path.join(root, relative);
  const fileStat = await stat(full).catch(() => null);
  if (!fileStat?.isFile()) fail(`missing ${relative}`);
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const textFiles = files.filter((file) => /\.(html|xml|txt)$/.test(file));

if (!files.some((file) => file.endsWith('sitemap-index.xml'))) {
  fail('missing sitemap-index.xml');
}

for (const file of textFiles) {
  const text = await readFile(file, 'utf8');
  const relative = path.relative(root, file);
  for (const phrase of forbidden) {
    if (text.includes(phrase)) fail(`${relative} contains forbidden text: ${phrase}`);
  }
}

for (const file of htmlFiles) {
  const text = await readFile(file, 'utf8');
  const relative = path.relative(root, file);
  const canonical = text.match(/<link rel="canonical" href="([^"]+)"/);
  if (!canonical) fail(`${relative} is missing rel=canonical`);
  else if (!canonical[1].startsWith('https://shemyu.github.io')) {
    fail(`${relative} canonical is not on shemyu.github.io: ${canonical[1]}`);
  }
  for (const needle of [
    'rel="alternate" hreflang=',
    'hreflang="x-default"',
    'property="og:title"',
    'property="og:description"',
    'property="og:url"',
    'property="og:type"',
    'name="twitter:card"',
    'name="twitter:title"',
    'name="twitter:description"',
  ]) {
    if (!text.includes(needle)) fail(`${relative} is missing ${needle}`);
  }
}

const home = await readFile(path.join(root, 'index.html'), 'utf8');
const zhHome = await readFile(path.join(root, 'zh/index.html'), 'utf8');
const about = await readFile(path.join(root, 'about/index.html'), 'utf8');
const zhAbout = await readFile(path.join(root, 'zh/about/index.html'), 'utf8');
const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
const sitemapFiles = files.filter((file) => path.basename(file).startsWith('sitemap'));
const sitemap = (await Promise.all(sitemapFiles.map((file) => readFile(file, 'utf8')))).join('\n');
const rss = await readFile(path.join(root, 'rss.xml'), 'utf8');
const atom = await readFile(path.join(root, 'atom.xml'), 'utf8');
const zhRss = await readFile(path.join(root, 'zh/rss.xml'), 'utf8');
const zhAtom = await readFile(path.join(root, 'zh/atom.xml'), 'utf8');

if (!home.includes('lang="en"')) fail('English home is missing lang=en');
if (!zhHome.includes('lang="zh-Hant"')) fail('Chinese home is missing lang=zh-Hant');
if (!home.includes('hreflang="zh-Hant"') || !zhHome.includes('hreflang="en"')) {
  fail('home pages are missing a cross-language hreflang');
}
if (!home.includes('https://github.com/ShemYu')) fail('English home is missing GitHub');
if (!home.includes('https://www.linkedin.com/in/shem-yu-a10494219')) fail('English home is missing LinkedIn');
if (!home.includes('https://x.com/ShemYuYu') || !zhHome.includes('https://x.com/ShemYuYu')) {
  fail('home pages are missing the X link');
}
if (home.includes('X (TODO)') || zhHome.includes('X (TODO)')) fail('home pages still show the X TODO');
if (!home.includes('No posts yet.') || !zhHome.includes('尚無文章。')) fail('empty post list copy is missing');
if (!about.includes('Draft — edit this before publishing.')) fail('English about is missing the draft banner');
if (!zhAbout.includes('草稿 — 發布前請自行修改。')) fail('Chinese about is missing the draft banner');
if (!about.includes('ML/AI engineer based in Tokyo')) fail('English about bio is missing');
if (!zhAbout.includes('機器學習／人工智慧工程師')) fail('Chinese about bio is missing');
if (!robots.includes('Sitemap: https://shemyu.github.io/sitemap-index.xml')) {
  fail('robots.txt is missing the sitemap URL');
}

for (const url of [
  'https://shemyu.github.io/',
  'https://shemyu.github.io/about/',
  'https://shemyu.github.io/posts/',
  'https://shemyu.github.io/zh/',
  'https://shemyu.github.io/zh/about/',
  'https://shemyu.github.io/zh/posts/',
]) {
  if (!sitemap.includes(url)) fail(`sitemap is missing ${url}`);
}
if (!sitemap.includes('zh-Hant')) fail('sitemap is missing zh-Hant');
if (sitemap.includes('example-draft')) fail('sitemap includes the draft post');

for (const [name, feed] of [
  ['rss.xml', rss],
  ['atom.xml', atom],
  ['zh/rss.xml', zhRss],
  ['zh/atom.xml', zhAtom],
]) {
  if (name.endsWith('rss.xml') && !feed.includes('<rss')) fail(`${name} is not RSS`);
  if (name.endsWith('atom.xml') && !feed.includes('http://www.w3.org/2005/Atom')) fail(`${name} is not Atom`);
  if (!feed.includes('Shem Yu')) fail(`${name} is missing the site title`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`check-dist: ok (${htmlFiles.length} html files)`);
