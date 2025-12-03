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
    // 获取订单簿数据
    const response = await fetch(
      `https://clob.polymarket.com/book?token_id=${tokenId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const data = await response.json();

    // 处理订单簿数据，添加累计深度
    if (data.bids && data.asks) {
      // 计算买单累计深度
      let bidCumulative = 0;
      const processedBids = data.bids.map((bid: any) => {
        bidCumulative += parseFloat(bid.size);
        return {
          price: parseFloat(bid.price),
          size: parseFloat(bid.size),
          cumulative: bidCumulative,
        };
      });

      // 计算卖单累计深度（从高价到低价）
      let askCumulative = 0;
      const sortedAsks = [...data.asks].sort((a: any, b: any) =>
        parseFloat(b.price) - parseFloat(a.price)
      );
      const processedAsks = sortedAsks.map((ask: any) => {
        askCumulative += parseFloat(ask.size);
        return {
          price: parseFloat(ask.price),
          size: parseFloat(ask.size),
          cumulative: askCumulative,
        };
      }).reverse();

      // 计算买卖压力
      const totalBidSize = processedBids.reduce((sum: number, b: any) => sum + b.size, 0);
      const totalAskSize = processedAsks.reduce((sum: number, a: any) => sum + a.size, 0);
      const buyPressure = totalBidSize / (totalBidSize + totalAskSize);

      return NextResponse.json({
        bids: processedBids,
        asks: processedAsks,
        market: data.market,
        timestamp: data.timestamp,
        stats: {
          totalBidSize,
          totalAskSize,
          buyPressure,
          sellPressure: 1 - buyPressure,
          bidLevels: processedBids.length,
          askLevels: processedAsks.length,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orderbook' },
      { status: 500 }
    );
  }
}
