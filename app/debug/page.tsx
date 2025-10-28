'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [status, setStatus] = useState<any>({});

  useEffect(() => {
    async function runDiagnostics() {
      const results: any = {};

      // 1. 测试市场API
      try {
        const res = await fetch('/api/markets?limit=1');
        const markets = await res.json();
        results.markets = {
          ok: res.ok,
          count: markets.length,
          sample: markets[0]
        };

        if (markets.length > 0) {
          const market = markets[0];

          // 2. 检查clobTokenIds
          let tokens: string[] = [];
          if (typeof market.clobTokenIds === 'string') {
            tokens = JSON.parse(market.clobTokenIds);
          } else if (Array.isArray(market.clobTokenIds)) {
            tokens = market.clobTokenIds;
          }

          results.clobTokenIds = {
            type: typeof market.clobTokenIds,
            isArray: Array.isArray(market.clobTokenIds),
            parsed: tokens,
            count: tokens.length
          };

          // 3. 测试价格API
          if (tokens.length > 0) {
            const priceRes = await fetch(`/api/prices?token=${tokens[0]}`);
            const priceData = await priceRes.json();

            results.prices = {
              ok: priceRes.ok,
              isArray: Array.isArray(priceData),
              count: Array.isArray(priceData) ? priceData.length : 0,
              sample: Array.isArray(priceData) ? priceData.slice(0, 3) : priceData
            };
          }
        }
      } catch (error: any) {
        results.error = error.message;
      }

      setStatus(results);
    }

    runDiagnostics();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">诊断报告</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">系统状态</h2>

        {Object.keys(status).length === 0 ? (
          <p>正在运行诊断...</p>
        ) : (
          <div className="space-y-4">
            {/* 市场API */}
            {status.markets && (
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">
                  ✅ 市场API: {status.markets.ok ? '正常' : '错误'}
                </h3>
                <p>找到 {status.markets.count} 个市场</p>
                {status.markets.sample && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">市场ID: {status.markets.sample.id}</p>
                    <p className="text-sm text-gray-600">问题: {status.markets.sample.question}</p>
                  </div>
                )}
              </div>
            )}

            {/* clobTokenIds */}
            {status.clobTokenIds && (
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">
                  {status.clobTokenIds.count > 0 ? '✅' : '❌'} clobTokenIds解析
                </h3>
                <p>原始类型: {status.clobTokenIds.type}</p>
                <p>是数组: {status.clobTokenIds.isArray ? '是' : '否'}</p>
                <p>解析后数量: {status.clobTokenIds.count}</p>
                {status.clobTokenIds.parsed.length > 0 && (
                  <p className="text-xs mt-2 break-all">
                    第一个Token: {status.clobTokenIds.parsed[0].substring(0, 20)}...
                  </p>
                )}
              </div>
            )}

            {/* 价格API */}
            {status.prices && (
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">
                  {status.prices.ok ? '✅' : '❌'} 价格API: {status.prices.ok ? '正常' : '错误'}
                </h3>
                <p>是数组: {status.prices.isArray ? '是' : '否'}</p>
                <p>数据点数量: {status.prices.count}</p>
                {status.prices.sample && (
                  <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs mt-2 overflow-x-auto">
                    {JSON.stringify(status.prices.sample, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* 错误 */}
            {status.error && (
              <div className="bg-red-100 p-4 rounded">
                <h3 className="font-semibold text-red-700 mb-2">❌ 错误</h3>
                <p className="text-red-600">{status.error}</p>
              </div>
            )}

            {/* 总结 */}
            <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/20 rounded">
              <h3 className="font-semibold text-lg mb-2">
                {status.prices && status.prices.count > 0 ? '✅ 所有测试通过！' : '⚠️ 存在问题'}
              </h3>
              {status.prices && status.prices.count > 0 ? (
                <p className="text-green-700 dark:text-green-400">
                  系统正常，图表应该能正常显示。如果图表仍然不显示，请清除浏览器缓存并刷新页面。
                </p>
              ) : (
                <p className="text-yellow-700 dark:text-yellow-400">
                  价格数据获取有问题，请检查API配置。
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <a
          href="/"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          返回首页
        </a>
        <a
          href="/test"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          完整测试
        </a>
      </div>
    </div>
  );
}
