import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    const data = await response.json();

    // 返回时添加缓存控制头，确保不被CDN或浏览器缓存
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching market:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market details' },
      { status: 500 }
    );
  }
}
