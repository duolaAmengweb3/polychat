import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    // 获取更多市场以便过滤
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?limit=100&closed=false&active=true`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(data);
    }

    // 过滤和排序市场
    const validMarkets = data
      .filter((market: any) => {
        // 解析 clobTokenIds（可能是字符串或数组）
        let tokens: any[] = [];
        try {
          if (typeof market.clobTokenIds === 'string') {
            tokens = JSON.parse(market.clobTokenIds);
          } else if (Array.isArray(market.clobTokenIds)) {
            tokens = market.clobTokenIds;
          }
        } catch (e) {
          return false;
        }

        // 只保留有 clobTokenIds 的市场（有价格数据）
        return tokens.length > 0 &&
               market.active === true &&
               // 过滤掉2025年之前的市场
               new Date(market.endDate) > new Date('2025-01-01');
      })
      .map((market: any) => {
        // 确保 clobTokenIds 是数组格式
        if (typeof market.clobTokenIds === 'string') {
          try {
            market.clobTokenIds = JSON.parse(market.clobTokenIds);
          } catch (e) {
            market.clobTokenIds = [];
          }
        }
        return market;
      })
      .sort((a: any, b: any) => {
        // 按24小时交易量排序，如果没有则按创建时间
        const volumeA = a.volume24hr || 0;
        const volumeB = b.volume24hr || 0;
        if (volumeB !== volumeA) {
          return volumeB - volumeA;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, limit);

    return NextResponse.json(validMarkets);
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}
