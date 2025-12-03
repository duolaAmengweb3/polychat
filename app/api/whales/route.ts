import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Polymarket 合约地址
const CTF_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E';
const CONDITIONAL_TOKENS = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045';

// Dune Analytics API 配置
const DUNE_API_KEY = process.env.DUNE_API_KEY;
const DUNE_WHALE_QUERY_ID = process.env.DUNE_WHALE_QUERY_ID || '3247891'; // 示例查询ID

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conditionId = searchParams.get('condition');
  const marketId = searchParams.get('market');

  if (!conditionId && !marketId) {
    return NextResponse.json({ error: 'Condition ID or Market ID is required' }, { status: 400 });
  }

  try {
    // 如果配置了 Dune API Key，则从 Dune 获取真实数据
    if (DUNE_API_KEY) {
      const duneResponse = await fetch(
        `https://api.dune.com/api/v1/query/${DUNE_WHALE_QUERY_ID}/results?api_key=${DUNE_API_KEY}&condition_id=${conditionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (duneResponse.ok) {
        const duneData = await duneResponse.json();
        return NextResponse.json({
          source: 'dune',
          data: duneData.result?.rows || [],
        });
      }
    }

    // 如果没有 Dune API Key，返回模拟数据结构
    // 这些数据用于演示 UI，实际使用时需要配置 Dune API
    const mockWhales = generateMockWhaleData();

    return NextResponse.json({
      source: 'mock',
      message: '配置 DUNE_API_KEY 环境变量以获取真实巨鲸数据',
      data: mockWhales,
      contracts: {
        ctfExchange: CTF_EXCHANGE,
        conditionalTokens: CONDITIONAL_TOKENS,
      },
    });
  } catch (error) {
    console.error('Error fetching whale data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch whale data' },
      { status: 500 }
    );
  }
}

// 生成模拟巨鲸数据
function generateMockWhaleData() {
  const mockAddresses = [
    '0x1234...abcd',
    '0x5678...efgh',
    '0x9abc...ijkl',
    '0xdef0...mnop',
    '0x2468...qrst',
  ];

  return mockAddresses.map((address, index) => ({
    rank: index + 1,
    address,
    position: ['Yes', 'No'][Math.floor(Math.random() * 2)],
    amount: Math.floor(Math.random() * 100000) + 10000,
    percentage: (20 - index * 3 + Math.random() * 2).toFixed(2),
    pnl: (Math.random() * 200 - 100).toFixed(2),
    winRate: (50 + Math.random() * 40).toFixed(1),
    isSmartMoney: index < 2,
    lastActivity: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  }));
}
