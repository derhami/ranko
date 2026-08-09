/**
 * Main audit page — run an audit, see live progress, view results.
 */

import { useState, useCallback } from 'react';
import { useAudit } from '../hooks/useAudit.js';
import { AuditRunner } from '../components/AuditRunner.js';
import { ProgressStream } from '../components/ProgressStream.js';
import { ScoreCircle } from '../components/ScoreCircle.js';
import { ScoreStats } from '../components/ScoreStats.js';
import { CategoryGrid } from '../components/CategoryGrid.js';
import { FilterTabs, type FilterStatus } from '../components/FilterTabs.js';
import { IssuesTable } from '../components/IssuesTable.js';
import { CategorySection } from '../components/CategorySection.js';
import { Sidebar } from '../components/Sidebar.js';
import { Footer } from '../components/Footer.js';
import { generateHtmlReport, copySummaryText, downloadJsonReport } from '../lib/export-report.js';

export function AuditPage() {
  const { status, progress, result, ruleMetadata, error, run, cancel, reset } = useAudit();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedToast, setCopiedToast] = useState(false);

  const handleRun = useCallback(
    (url: string, opts: { measureCwv: boolean; crawl: boolean; maxPages: number }) => {
      setFilter('all');
      setActiveCategory(null);
      setSearchQuery('');
      run(url, opts);
    },
    [run],
  );

  const handleCopySummary = async () => {
    if (!result) return;
    const ok = await copySummaryText(result);
    if (ok) {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    const el = document.getElementById(`category-${categoryId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleIssueClick = useCallback((ruleId: string, categoryId: string) => {
    // Expand the category section and scroll to the rule
    setActiveCategory(categoryId);
    setTimeout(() => {
      const el = document.getElementById(`rule-${ruleId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Flash highlight
      el?.classList.add('ring-2', 'ring-[var(--color-accent)]');
      setTimeout(() => el?.classList.remove('ring-2', 'ring-[var(--color-accent)]'), 2000);
    }, 100);
  }, []);

  // Calculate filter counts from result
  const counts = result
    ? {
        all: result.categoryResults.reduce(
          (n, c) => n + new Set(c.results.map((r) => r.ruleId)).size,
          0,
        ),
        fail: result.categoryResults.reduce((n, c) => {
          const unique = new Set(c.results.filter((r) => r.status === 'fail').map((r) => r.ruleId));
          return n + unique.size;
        }, 0),
        warn: result.categoryResults.reduce((n, c) => {
          const unique = new Set(c.results.filter((r) => r.status === 'warn').map((r) => r.ruleId));
          return n + unique.size;
        }, 0),
        pass: result.categoryResults.reduce((n, c) => {
          const unique = new Set(c.results.filter((r) => r.status === 'pass').map((r) => r.ruleId));
          return n + unique.size;
        }, 0),
      }
    : { all: 0, fail: 0, warn: 0, pass: 0 };

  const totalFail = result?.categoryResults.reduce((n, c) => n + c.failCount, 0) ?? 0;
  const totalWarn = result?.categoryResults.reduce((n, c) => n + c.warnCount, 0) ?? 0;
  const totalPass = result?.categoryResults.reduce((n, c) => n + c.passCount, 0) ?? 0;

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <div className="flex flex-1">
        {/* Sidebar (only when results are shown) */}
        {status === 'complete' && result && (
          <Sidebar
            categories={result.categoryResults}
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryClick}
          />
        )}

        {/* Main content */}
        <div
          className="flex-1 pt-[var(--header-height)] transition-all"
          style={{ marginRight: status === 'complete' && result ? 'var(--sidebar-width)' : '0' }}
        >
          <div className="max-w-[var(--content-max-width)] mx-auto p-6 space-y-6">
            {/* Audit runner form */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <AuditRunner isRunning={status === 'running'} onRun={handleRun} onCancel={cancel} />
            </div>

            {/* Running state: progress stream */}
            {status === 'running' && (
              <div className="p-5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <ProgressStream progress={progress} />
              </div>
            )}

            {/* Error state */}
            {status === 'error' && error && (
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-fail-bg)',
                  borderColor: 'var(--color-fail)',
                  color: 'var(--color-fail)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">خطا در اجرای ممیزی سئو</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                  <button
                    onClick={reset}
                    className="px-3 py-1.5 text-sm rounded-md font-medium"
                    style={{
                      backgroundColor: 'var(--color-fail)',
                      color: '#fff',
                    }}
                  >
                    تلاش مجدد
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {status === 'complete' && result && (
              <>
                {/* Score overview & Export bar */}
                <div
                  className="p-6 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-5"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <ScoreCircle score={result.overallScore} size={130} />
                      <div className="space-y-2">
                        <div>
                          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                            امتیاز کل سئو
                          </h2>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                            {result.categoryResults.length} دسته‌بندی ارزیابی شد
                            {result.crawledPages > 1 && ` در ${result.crawledPages} صفحه`}
                          </p>
                        </div>
                        <ScoreStats passCount={totalPass} warnCount={totalWarn} failCount={totalFail} />
                      </div>
                    </div>

                    {/* Export / Share Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
                      <button
                        onClick={() => generateHtmlReport(result, ruleMetadata)}
                        className="px-3 py-2 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5 shadow-sm transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, var(--color-accent), #3b82f6)' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>دریافت گزارش (HTML / چاپ)</span>
                      </button>

                      <button
                        onClick={handleCopySummary}
                        className="px-3 py-2 text-xs font-semibold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] flex items-center gap-1.5 transition-all relative"
                        style={{ color: 'var(--color-text)' }}
                      >
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>{copiedToast ? 'کپی شد! ✓' : 'کپی خلاصه گزارش'}</span>
                      </button>

                      <button
                        onClick={() => downloadJsonReport(result)}
                        className="px-3 py-2 text-xs font-semibold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] flex items-center gap-1.5 transition-all"
                        style={{ color: 'var(--color-text-secondary)' }}
                        title="دانلود داده خروجی JSON"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>JSON</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category progress grid */}
                <div className="p-5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                    امتیاز دسته‌بندی‌های ۲۰‌گانه
                  </h3>
                  <CategoryGrid
                    categories={result.categoryResults}
                    activeCategory={activeCategory}
                    onCategoryClick={handleCategoryClick}
                  />
                </div>

                {/* Issues summary table */}
                {(totalFail > 0 || totalWarn > 0) && (
                  <div className="p-5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                      مشکلات و خطاهای نیازمند اصلاح
                    </h3>
                    <IssuesTable result={result} ruleMetadata={ruleMetadata} onIssueClick={handleIssueClick} />
                  </div>
                )}

                {/* Filter tabs + detailed results */}
                <div className="p-5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                      جزئیات کامل ارزیابی
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Search box */}
                      <div className="relative min-w-[200px]">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="جستجو در قوانین (مثلاً canonical، h1)..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                          style={{ color: 'var(--color-text)' }}
                        />
                        <svg className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[var(--color-text-muted)] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      <FilterTabs active={filter} counts={counts} onChange={setFilter} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    {result.categoryResults.map((cat) => (
                      <CategorySection
                        key={cat.categoryId}
                        category={cat}
                        filter={filter}
                        ruleMetadata={ruleMetadata}
                        searchQuery={searchQuery}
                        defaultExpanded={
                          activeCategory === cat.categoryId ||
                          (filter === 'fail' && cat.failCount > 0)
                        }
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Idle state */}
            {status === 'idle' && (
              <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
                <svg
                  className="mx-auto mb-5"
                  width="52"
                  height="52"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                  <path d="M11 8v6" />
                  <path d="M8 11h6" />
                </svg>
                <p className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                  آماده برای آنالیز و ممیزی سئو
                </p>
                <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                  آدرس وب‌سایت خود را در کادر بالا وارد کنید تا ممیزی جامع کدهای سایت، فاکتورهای فنی و محتوایی شروع شود.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span
                    className="text-xs px-3 py-1.5 rounded-full font-semibold"
                    style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
                  >
                    ۲۵۱ قانون سئو
                  </span>
                  <span
                    className="text-xs px-3 py-1.5 rounded-full font-semibold"
                    style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)' }}
                  >
                    ۲۰ دسته‌بندی تخصصی
                  </span>
                  <span
                    className="text-xs px-3 py-1.5 rounded-full font-semibold"
                    style={{ backgroundColor: 'var(--color-pass-bg)', color: 'var(--color-pass)' }}
                  >
                    سنجش Core Web Vitals
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
