/**
 * Live progress display during an audit with Progress Bar & Estimated Time Remaining (ETA).
 * Shows categories with animated checkmarks/spinners as they complete.
 */

import { useState, useEffect, useRef } from 'react';
import type { AuditProgress } from '../stores/audit-store.js';
import { CATEGORY_NAMES_FA } from '../lib/format.js';

interface ProgressStreamProps {
  progress: AuditProgress;
}

// All 20 category display names in audit order
const ALL_CATEGORIES = [
  { id: 'core', name: CATEGORY_NAMES_FA.core },
  { id: 'technical', name: CATEGORY_NAMES_FA.technical },
  { id: 'perf', name: CATEGORY_NAMES_FA.perf },
  { id: 'links', name: CATEGORY_NAMES_FA.links },
  { id: 'images', name: CATEGORY_NAMES_FA.images },
  { id: 'security', name: CATEGORY_NAMES_FA.security },
  { id: 'crawl', name: CATEGORY_NAMES_FA.crawl },
  { id: 'schema', name: CATEGORY_NAMES_FA.schema },
  { id: 'a11y', name: CATEGORY_NAMES_FA.a11y },
  { id: 'content', name: CATEGORY_NAMES_FA.content },
  { id: 'social', name: CATEGORY_NAMES_FA.social },
  { id: 'eeat', name: CATEGORY_NAMES_FA.eeat },
  { id: 'url', name: CATEGORY_NAMES_FA.url },
  { id: 'mobile', name: CATEGORY_NAMES_FA.mobile },
  { id: 'i18n', name: CATEGORY_NAMES_FA.i18n },
  { id: 'legal', name: CATEGORY_NAMES_FA.legal },
  { id: 'js', name: CATEGORY_NAMES_FA.js },
  { id: 'redirect', name: CATEGORY_NAMES_FA.redirect },
  { id: 'htmlval', name: CATEGORY_NAMES_FA.htmlval },
  { id: 'geo', name: CATEGORY_NAMES_FA.geo },
];

export function ProgressStream({ progress }: ProgressStreamProps) {
  const completedIds = new Set(progress.completedCategories.map((c) => c.categoryId));
  const completedCount = completedIds.size;
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate ETA
  let etaText = 'در حال محاسبه زمان...';
  const remainingCategories = ALL_CATEGORIES.length - completedCount;

  if (completedCount > 0) {
    const avgSecPerCategory = elapsedSeconds / completedCount;
    const estimatedRemainingSec = Math.ceil(avgSecPerCategory * remainingCategories);

    if (estimatedRemainingSec <= 2) {
      etaText = 'چند لحظه دیگر تکمیلی...';
    } else if (estimatedRemainingSec < 60) {
      etaText = `حدود ${estimatedRemainingSec} ثانیه باقی‌مانده`;
    } else {
      const mins = Math.floor(estimatedRemainingSec / 60);
      const secs = estimatedRemainingSec % 60;
      etaText = `حدود ${mins} دقیقه و ${secs} ثانیه باقی‌مانده`;
    }
  } else if (elapsedSeconds > 0) {
    const initialEstimate = Math.max(2, 20 - elapsedSeconds);
    etaText = `حدود ${initialEstimate} ثانیه باقی‌مانده`;
  }

  const percent = Math.round((completedCount / ALL_CATEGORIES.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress header & Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              در حال آنالیز و ممیزی هوشمند سئو...
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-[var(--color-bg-hover)]" style={{ color: 'var(--color-text-secondary)' }}>
              زمان سپری شده: {elapsedSeconds} ثانیه
            </span>
            <span className="font-semibold text-indigo-500">
              {percent}٪ ({completedCount} از {ALL_CATEGORIES.length})
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative h-3 rounded-full bg-[var(--color-border)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* ETA & Crawl status text */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="font-medium flex items-center gap-1 text-emerald-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            تخمین زمان باقی‌مانده: {etaText}
          </span>

          {progress.totalPages > 1 && (
            <span className="font-mono text-indigo-400">
              در حال خزش صفحه {progress.currentPage} از {progress.totalPages}
            </span>
          )}
        </div>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--color-border)]">
        {ALL_CATEGORIES.map(({ id, name }) => {
          const completed = completedIds.has(id);
          const isCurrent = progress.currentCategory === id;

          return (
            <div
              key={id}
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${
                completed
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : isCurrent
                  ? 'border-indigo-500/50 bg-indigo-500/10'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)]'
              }`}
            >
              {completed ? (
                <span className="text-emerald-500 font-bold">✓</span>
              ) : isCurrent ? (
                <span className="inline-block w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full border border-[var(--color-border)] shrink-0" />
              )}
              <span
                className="truncate font-medium"
                style={{
                  color: completed
                    ? 'var(--color-text)'
                    : isCurrent
                    ? 'var(--color-accent)'
                    : 'var(--color-text-muted)',
                }}
              >
                {name}
              </span>
              {completed && (
                <span className="text-[10px] font-mono mr-auto font-bold text-emerald-500">
                  {Math.round(
                    progress.completedCategories.find((c) => c.categoryId === id)?.result.score ?? 0,
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
