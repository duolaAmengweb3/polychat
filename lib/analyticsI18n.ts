import { MarketAnalytics } from './analytics';
import { Language } from './translations';

export function getTrendLabel(trend: MarketAnalytics['trend'], lang: Language): string {
  const labels = {
    strong_up: { en: 'Strong Uptrend', zh: '强劲上涨' },
    up: { en: 'Moderate Uptrend', zh: '温和上涨' },
    stable: { en: 'Sideways', zh: '横盘震荡' },
    down: { en: 'Moderate Downtrend', zh: '温和下跌' },
    strong_down: { en: 'Strong Downtrend', zh: '强劲下跌' },
  };
  return labels[trend][lang];
}

export function getTrendDescription(trend: MarketAnalytics['trend'], lang: Language): string {
  const descriptions = {
    strong_up: {
      en: 'Market sentiment very optimistic, price rising rapidly',
      zh: '市场情绪非常乐观，价格持续快速上涨'
    },
    up: {
      en: 'Market steadily improving, price rising moderately',
      zh: '市场稳步向好，价格温和上涨'
    },
    stable: {
      en: 'Market in balance, price fluctuating within range',
      zh: '市场处于平衡状态，价格在区间内波动'
    },
    down: {
      en: 'Market sentiment weakening, price gradually declining',
      zh: '市场情绪转弱，价格逐步下降'
    },
    strong_down: {
      en: 'Market sentiment pessimistic, price falling rapidly',
      zh: '市场情绪悲观，价格快速下降'
    },
  };
  return descriptions[trend][lang];
}

export function getVolatilityLabel(level: MarketAnalytics['volatilityLevel'], lang: Language): string {
  const labels = {
    low: { en: 'Low Volatility', zh: '低波动' },
    medium: { en: 'Medium Volatility', zh: '中等波动' },
    high: { en: 'High Volatility', zh: '高波动' },
    extreme: { en: 'Extreme Volatility', zh: '极端波动' },
  };
  return labels[level][lang];
}

export function getMomentumLabel(momentum: number, lang: Language): string {
  if (momentum > 0.05) {
    return lang === 'en' ? 'Upward' : '向上';
  } else if (momentum < -0.05) {
    return lang === 'en' ? 'Downward' : '向下';
  } else {
    return lang === 'en' ? 'Stable' : '平稳';
  }
}

export function getSharpChangesLabel(changes: number, lang: Language): string {
  if (changes > 10) {
    return lang === 'en' ? 'Frequent' : '频繁';
  } else if (changes > 5) {
    return lang === 'en' ? 'Moderate' : '中等';
  } else {
    return lang === 'en' ? 'Stable' : '稳定';
  }
}

export function getDataQualityLabel(quality: MarketAnalytics['dataQuality'], lang: Language): string {
  const labels = {
    good: { en: 'Complete', zh: '数据完整' },
    fair: { en: 'Fair', zh: '数据尚可' },
    poor: { en: 'Sparse', zh: '数据稀疏' },
  };
  return labels[quality][lang];
}
