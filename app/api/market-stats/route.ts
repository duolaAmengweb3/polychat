import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenId = searchParams.get('token');

  if (!tokenId) {
    return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
  }

  try {
    // 并行获取多个数据
    const [midpointRes, spreadRes] = await Promise.all([
      fetch(`https://clob.polymarket.com/midpoint?token_id=${tokenId}`, { cache: 'no-store' }),
      fetch(`https://clob.polymarket.com/spread?token_id=${tokenId}`, { cache: 'no-store' }),
    ]);

    const [midpoint, spread] = await Promise.all([
      midpointRes.json(),
      spreadRes.json(),
    ]);

    return NextResponse.json({
      midpoint: midpoint.mid ? parseFloat(midpoint.mid) : null,
      spread: spread.spread ? parseFloat(spread.spread) : null,
    });
  } catch (error) {
    console.error('Error fetching market stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market stats' },
      { status: 500 }
    );
  }
}
