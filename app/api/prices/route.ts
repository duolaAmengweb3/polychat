import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenId = searchParams.get('token');
  const fidelity = searchParams.get('fidelity') || '60'; // 60 minutes

  if (!tokenId) {
    return NextResponse.json(
      { error: 'Token ID is required' },
      { status: 400 }
    );
  }

  // 获取过去7天的数据
  const now = Math.floor(Date.now() / 1000);
  const weekAgo = now - 7 * 24 * 3600;

  try {
    // 使用 market 参数而不是 token
    const response = await fetch(
      `https://clob.polymarket.com/prices-history?market=${tokenId}&startTs=${weekAgo}&endTs=${now}&fidelity=${fidelity}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const data = await response.json();

    // API 返回 {history: [...]} 格式，提取 history 数组
    if (data.history && Array.isArray(data.history)) {
      return NextResponse.json(data.history);
    }

    // 如果没有 history 或为空，返回空数组
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    );
  }
}
