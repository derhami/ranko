/**
 * Sortable table of fail+warn issues across all categories.
 */

import type { AuditResult } from '../../../src/types.js';
import type { RuleMetadataIpc } from '../../shared/ipc-types.js';
import { formatRuleIdAsName, getStatusColorClass, getStatusIcon, CATEGORY_NAMES_FA } from '../lib/format.js';

interface IssuesTableProps {
  result: AuditResult;
  ruleMetadata?: Record<string, RuleMetadataIpc>;
  onIssueClick?: (ruleId: string, categoryId: string) => void;
}

interface IssueRow {
  ruleId: string;
  ruleName: string;
  categoryId: string;
  categoryName: string;
  status: 'fail' | 'warn';
  message: string;
  pageUrl: string | null;
  count: number;
}

export function IssuesTable({ result, ruleMetadata, onIssueClick }: IssuesTableProps) {
  // Aggregate issues across categories
  const issues: IssueRow[] = [];
  for (const cat of result.categoryResults) {
    const ruleMap = new Map<string, IssueRow>();
    for (const rule of cat.results) {
      if (rule.status === 'pass') continue;
      const existing = ruleMap.get(rule.ruleId);
      if (existing) {
        existing.count++;
      } else {
        const pageUrl = rule.details?.pageUrl as string | undefined;
        ruleMap.set(rule.ruleId, {
          ruleId: rule.ruleId,
          ruleName: ruleMetadata?.[rule.ruleId]?.name ?? formatRuleIdAsName(rule.ruleId),
          categoryId: cat.categoryId,
          categoryName: CATEGORY_NAMES_FA[cat.categoryId] ?? cat.categoryId,
          status: rule.status as 'fail' | 'warn',
          message: rule.message,
          pageUrl: pageUrl ?? null,
          count: 1,
        });
      }
    }
    issues.push(...ruleMap.values());
  }

  // Sort: failures first, then by count descending
  issues.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'fail' ? -1 : 1;
    return b.count - a.count;
  });

  if (issues.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
        هیچ خطایی یافت نشد.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-bg-hover)]">
            <th className="text-right p-3 font-medium text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>مشکل / قانون سئو</th>
            <th className="text-right p-3 font-medium text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>صفحه مربوطه</th>
            <th className="text-center p-3 font-medium text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>سطح اهمیت</th>
            {result.crawledPages > 1 && (
              <th className="text-center p-3 font-medium text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>تعداد صفحات</th>
            )}
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr
              key={`${issue.categoryId}-${issue.ruleId}`}
              onClick={() => onIssueClick?.(issue.ruleId, issue.categoryId)}
              className="border-t border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors"
            >
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getStatusColorClass(issue.status)}`}>
                    {getStatusIcon(issue.status)}
                  </span>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--color-text)' }}>{issue.ruleName}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{issue.categoryName}</div>
                  </div>
                </div>
              </td>
              <td className="p-3" style={{ color: 'var(--color-text-secondary)' }}>
                {issue.pageUrl ? (
                  <a
                    href={issue.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono hover:underline"
                    style={{ color: 'var(--color-accent)' }}
                    onClick={(e) => e.stopPropagation()}
                    dir="ltr"
                  >
                    {(() => { try { return new URL(issue.pageUrl).pathname; } catch { return issue.pageUrl; } })()}
                  </a>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</span>
                )}
              </td>
              <td className="p-3 text-center">
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium"
                  style={{
                    color: issue.status === 'fail' ? 'var(--color-fail)' : 'var(--color-warn)',
                    backgroundColor: issue.status === 'fail' ? 'var(--color-fail-bg)' : 'var(--color-warn-bg)',
                  }}
                >
                  {issue.status === 'fail' ? 'بحرانی' : 'هشدار'}
                </span>
              </td>
              {result.crawledPages > 1 && (
                <td className="p-3 text-center font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {issue.count}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
