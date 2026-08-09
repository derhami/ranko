/**
 * Table of past audits from the database.
 */

import type { AuditSummaryIpc } from '../../shared/ipc-types.js';
import { getScoreColor, formatDate } from '../lib/format.js';

interface AuditListProps {
  audits: AuditSummaryIpc[];
  loading: boolean;
  onAuditClick?: (auditId: string) => void;
}

export function AuditList({ audits, loading, onAuditClick }: AuditListProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        در حال بارگذاری ممیزی‌های گذشته...
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        هیچ ممیزی یافت نشد. اولین ممیزی سئو خود را در زبانه «تحلیل سئو» اجرا کنید.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-bg-hover)]">
            <th className="text-right p-3 font-medium" style={{ color: 'var(--color-text-secondary)' }}>تاریخ و زمان</th>
            <th className="text-right p-3 font-medium" style={{ color: 'var(--color-text-secondary)' }}>آدرس وب‌سایت</th>
            <th className="text-center p-3 font-medium" style={{ color: 'var(--color-text-secondary)' }}>امتیاز کل</th>
            <th className="text-center p-3 font-medium" style={{ color: 'var(--color-text-secondary)' }}>صفحات</th>
            <th className="text-center p-3 font-medium" style={{ color: 'var(--color-text-secondary)' }}>خلاصه نتایج</th>
            <th className="w-10 p-3"></th>
          </tr>
        </thead>
        <tbody>
          {audits.map((audit) => {
            const scoreColor = getScoreColor(audit.overallScore);
            return (
              <tr
                key={audit.auditId}
                className="border-t border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
                onClick={() => onAuditClick?.(audit.auditId)}
              >
                <td className="p-3 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDate(audit.startedAt)}
                </td>
                <td className="p-3 truncate max-w-xs font-mono text-xs" style={{ color: 'var(--color-text)' }} dir="ltr">
                  {audit.startUrl}
                </td>
                <td className="p-3 text-center">
                  <span
                    className="text-sm font-bold px-2 py-0.5 rounded-full font-mono"
                    style={{ color: scoreColor, backgroundColor: `${scoreColor}15` }}
                  >
                    {Math.round(audit.overallScore)}
                  </span>
                </td>
                <td className="p-3 text-center font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {audit.pagesAudited}
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2 font-mono text-xs">
                    {audit.failedCount > 0 && (
                      <span className="text-xs" style={{ color: 'var(--color-fail)' }}>
                        {audit.failedCount} خطا
                      </span>
                    )}
                    {audit.warningCount > 0 && (
                      <span className="text-xs" style={{ color: 'var(--color-warn)' }}>
                        {audit.warningCount} هشدار
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--color-pass)' }}>
                      {audit.passedCount} پاس
                    </span>
                  </div>
                </td>
                <td className="p-3 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-180">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
