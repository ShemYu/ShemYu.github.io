import { atomResponse } from '../../lib/feeds';

export async function GET() {
  return atomResponse('zh');
}
