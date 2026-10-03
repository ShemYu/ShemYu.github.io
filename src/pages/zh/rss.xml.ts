import type { APIContext } from 'astro';
import { rssResponse } from '../../lib/feeds';

export async function GET(context: APIContext) {
  return rssResponse('zh', context);
}
