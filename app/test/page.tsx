'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestPage() {
  const [apiTests, setApiTests] = useState<{ [key: string]: { status: string; data?: any; error?: string } }>({});
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setApiTests({});

    // Test 0: 首页加载测试
    try {
      const response = await fetch('/');
      const isOk = response.ok && response.status === 200;

      setApiTests(prev => ({
        ...prev,
        homepage: {
          status: isOk ? 'success' : 'error',
          data: { statusCode: response.status, statusText: response.statusText },
          error: !isOk ? `页面返回 ${response.status} 错误` : undefined
        }
      }));
    } catch (error) {
      setApiTests(prev => ({
        ...prev,
        homepage: { status: 'error', error: String(error) }
      }));
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    // Test 1: Markets API
    try {
      const response = await fetch('/api/markets?limit=5');
      const data = await response.json();

      setApiTests(prev => ({
        ...prev,
        markets: {
          status: response.ok && Array.isArray(data) && data.length > 0 ? 'success' : 'error',
          data: data.slice(0, 2), // 只显示前2个
          error: !response.ok ? '无法获取市场数据' : !Array.isArray(data) ? '返回数据格式错误' : data.length === 0 ? '没有找到有效市场' : undefined
        }
      }));
    } catch (error) {
      setApiTests(prev => ({
        ...prev,
        markets: { status: 'error', error: String(error) }
      }));
    }

    // Test 2: Market Detail API
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const marketsResponse = await fetch('/api/markets?limit=1');
      const markets = await marketsResponse.json();

      if (markets && markets.length > 0) {
        const marketId = markets[0].id;
        const response = await fetch(`/api/market/${marketId}`);
        const data = await response.json();

        // 解析clobTokenIds
        let tokens: string[] = [];
        try {
          if (typeof data.clobTokenIds === 'string') {
            tokens = JSON.parse(data.clobTokenIds);
          } else if (Array.isArray(data.clobTokenIds)) {
            tokens = data.clobTokenIds;
          }
        } catch (e) {
          // ignore
        }

        setApiTests(prev => ({
          ...prev,
          marketDetail: {
            status: response.ok && data.id && tokens.length > 0 ? 'success' : 'error',
            data: {
              id: data.id,
              question: data.question,
              clobTokenIds: tokens,
              tokenCount: tokens.length
            },
            error: !response.ok ? '无法获取市场详情' : tokens.length === 0 ? '市场没有clobTokenIds' : undefined
          }
        }));
      }
    } catch (error) {
      setApiTests(prev => ({
        ...prev,
        marketDetail: { status: 'error', error: String(error) }
      }));
    }

    // Test 3: Price History API
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const marketsResponse = await fetch('/api/markets?limit=1');
      const markets = await marketsResponse.json();

      if (markets && markets.length > 0) {
        let tokenId: string | undefined;
        const clobTokenIds = markets[0].clobTokenIds;

        if (typeof clobTokenIds === 'string') {
          const parsed = JSON.parse(clobTokenIds);
          tokenId = parsed[0];
        } else if (Array.isArray(clobTokenIds)) {
          tokenId = clobTokenIds[0];
        }

        if (tokenId) {
          const response = await fetch(`/api/prices?token=${tokenId}`);
          const data = await response.json();

          setApiTests(prev => ({
            ...prev,
            priceHistory: {
              status: response.ok && Array.isArray(data) ? 'success' : 'error',
              data: { count: data.length, sample: data[0] },
              error: !response.ok ? '无法获取价格历史' : !Array.isArray(data) ? '返回数据格式错误' : undefined
            }
          }));
        }
      }
    } catch (error) {
      setApiTests(prev => ({
        ...prev,
        priceHistory: { status: 'error', error: String(error) }
      }));
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/" className="text-purple-600 dark:text-purple-400 hover:underline">
          ← 返回首页
        </Link>
        <h1 className="text-4xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">
          系统测试
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          验证所有API和功能是否正常工作
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isRunning ? '测试运行中...' : '开始测试'}
        </button>
      </div>

      {Object.keys(apiTests).length > 0 && (
        <div className="space-y-6">
          {/* Homepage Test */}
          {apiTests.homepage && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  0. 首页加载测试
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apiTests.homepage.status)}`}>
                  {apiTests.homepage.status === 'success' ? '通过' : '失败'}
                </span>
              </div>
              {apiTests.homepage.error && (
                <p className="text-red-600 dark:text-red-400 text-sm mb-2">
                  ❌ 错误: {apiTests.homepage.error}
                  <br />
                  <span className="text-xs">这通常意味着服务器500错误，请检查控制台日志</span>
                </p>
              )}
              {apiTests.homepage.data && (
                <pre className="bg-gray-100 dark:bg-slate-900 p-4 rounded text-xs overflow-x-auto">
                  {JSON.stringify(apiTests.homepage.data, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Markets API Test */}
          {apiTests.markets && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  1. 市场列表 API
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apiTests.markets.status)}`}>
                  {apiTests.markets.status === 'success' ? '通过' : '失败'}
                </span>
              </div>
              {apiTests.markets.error && (
                <p className="text-red-600 dark:text-red-400 text-sm mb-2">错误: {apiTests.markets.error}</p>
              )}
              {apiTests.markets.data && (
                <pre className="bg-gray-100 dark:bg-slate-900 p-4 rounded text-xs overflow-x-auto">
                  {JSON.stringify(apiTests.markets.data, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Market Detail Test */}
          {apiTests.marketDetail && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  2. 市场详情 API
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apiTests.marketDetail.status)}`}>
                  {apiTests.marketDetail.status === 'success' ? '通过' : '失败'}
                </span>
              </div>
              {apiTests.marketDetail.error && (
                <p className="text-red-600 dark:text-red-400 text-sm mb-2">错误: {apiTests.marketDetail.error}</p>
              )}
              {apiTests.marketDetail.data && (
                <pre className="bg-gray-100 dark:bg-slate-900 p-4 rounded text-xs overflow-x-auto">
                  {JSON.stringify(apiTests.marketDetail.data, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Price History Test */}
          {apiTests.priceHistory && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  3. 价格历史 API
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apiTests.priceHistory.status)}`}>
                  {apiTests.priceHistory.status === 'success' ? '通过' : '失败'}
                </span>
              </div>
              {apiTests.priceHistory.error && (
                <p className="text-red-600 dark:text-red-400 text-sm mb-2">错误: {apiTests.priceHistory.error}</p>
              )}
              {apiTests.priceHistory.data && (
                <pre className="bg-gray-100 dark:bg-slate-900 p-4 rounded text-xs overflow-x-auto">
                  {JSON.stringify(apiTests.priceHistory.data, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              测试总结
            </h3>
            <div className="space-y-2">
              {Object.entries(apiTests).map(([key, result]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{key}</span>
                  <span className={`text-sm ${result.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {result.status === 'success' ? '✓ 通过' : '✗ 失败'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
