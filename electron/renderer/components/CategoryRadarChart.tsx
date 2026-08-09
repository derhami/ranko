/**
 * Radar / Polar & Donut visual chart component for category SEO scores.
 * Uses recharts to render an interactive category score diagram.
 */

import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { CategoryResult } from '../../../src/types.js';
import { CATEGORY_NAMES_FA } from '../lib/format.js';

interface CategoryRadarChartProps {
  categories: CategoryResult[];
}

// Map 20 categories into 5 main SEO Pillars for the high-level radar
const PILLAR_MAPPING: Record<string, string> = {
  technical: 'فنی و ساختار',
  core: 'فنی و ساختار',
  crawl: 'فنی و ساختار',
  redirect: 'فنی و ساختار',
  url: 'فنی و ساختار',

  content: 'محتوا و ارتباط',
  eeat: 'محتوا و ارتباط',
  schema: 'محتوا و ارتباط',
  social: 'محتوا و ارتباط',

  perf: 'سرعت و کارایی',
  mobile: 'سرعت و کارایی',
  js: 'سرعت و کارایی',
  a11y: 'سرعت و کارایی',

  security: 'امنیت و استاندارد',
  legal: 'امنیت و استاندارد',
  htmlval: 'امنیت و استاندارد',

  links: 'لینک‌ها و اعتبار',
  images: 'لینک‌ها و اعتبار',
  i18n: 'لینک‌ها و اعتبار',
  geo: 'لینک‌ها و اعتبار',
};

export function CategoryRadarChart({ categories }: CategoryRadarChartProps) {
  const [chartType, setChartType] = useState<'radar' | 'donut'>('radar');

  // 1. Group categories by Pillars
  const pillarScores: Record<string, { totalScore: number; count: number }> = {};

  categories.forEach((cat) => {
    const pillarName = PILLAR_MAPPING[cat.categoryId] ?? 'سایر فاکتورها';
    if (!pillarScores[pillarName]) {
      pillarScores[pillarName] = { totalScore: 0, count: 0 };
    }
    pillarScores[pillarName].totalScore += cat.score;
    pillarScores[pillarName].count += 1;
  });

  const pillarData = Object.entries(pillarScores).map(([name, data]) => ({
    subject: name,
    score: Math.round(data.totalScore / data.count),
    fullMark: 100,
  }));

  // 2. Full 20 categories data for detailed radar
  const allCategoriesData = categories.map((cat) => ({
    subject: CATEGORY_NAMES_FA[cat.categoryId] ?? cat.categoryId,
    score: Math.round(cat.score),
    fullMark: 100,
  }));

  // Colors for Donut chart
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="p-5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Header with toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            تحلیل بصری امتیازات سئو (نمودار راداری و دایره‌ای)
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            بررسی تعادل و پراکندگی امتیازات در ستون‌های اصلی سئو
          </p>
        </div>

        {/* Chart type tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
          <button
            onClick={() => setChartType('radar')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              chartType === 'radar'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'hover:bg-[var(--color-bg-hover)]'
            }`}
            style={{
              color: chartType === 'radar' ? '#fff' : 'var(--color-text-secondary)',
            }}
          >
            نمودار راداری (Radar)
          </button>
          <button
            onClick={() => setChartType('donut')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              chartType === 'donut'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'hover:bg-[var(--color-bg-hover)]'
            }`}
            style={{
              color: chartType === 'donut' ? '#fff' : 'var(--color-text-secondary)',
            }}
          >
            نمودار دایره‌ای (Pie)
          </button>
        </div>
      </div>

      {/* Chart visualization area */}
      <div className="h-[280px] w-full flex items-center justify-center pt-2">
        {chartType === 'radar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={pillarData}>
              <PolarGrid stroke="var(--color-border)" opacity={0.6} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'var(--color-text)', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} />
              <Radar
                name="امتیاز سئو"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.35}
              />
              <Tooltip
                formatter={(value: any) => [`${value} از ۱۰۰`, 'امتیاز']}
                contentStyle={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text)',
                  fontSize: '12px',
                  direction: 'rtl',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pillarData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="score"
                nameKey="subject"
                label={({ subject, score }) => `${subject}: ${score}`}
              >
                {pillarData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value}٪`, 'امتیاز میانگین']}
                contentStyle={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text)',
                  fontSize: '12px',
                  direction: 'rtl',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pillar legend cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[var(--color-border)]">
        {pillarData.map((p, idx) => (
          <div
            key={p.subject}
            className="p-2 rounded-lg border border-[var(--color-border)] text-center bg-[var(--color-bg)]"
          >
            <div className="text-[11px] font-medium truncate" style={{ color: 'var(--color-text-muted)' }}>
              {p.subject}
            </div>
            <div
              className="text-sm font-bold mt-0.5"
              style={{
                color:
                  p.score >= 80
                    ? 'var(--color-pass)'
                    : p.score >= 50
                    ? 'var(--color-warn)'
                    : 'var(--color-fail)',
              }}
            >
              {p.score}٪
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
