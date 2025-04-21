import type { NextRequest } from 'next/server';
import { loadFonts, createOGResponse } from '@/utils/og-image';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title'),
    description = searchParams.get('description');

  const fonts = await loadFonts();

  return createOGResponse({
    title: title ?? 'Avalanche Academy',
    description: description ?? 'The Learning Platform for Avalanche Ecosystem.',
    path: 'academy',
    fonts
  });
}