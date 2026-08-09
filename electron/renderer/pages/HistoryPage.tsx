/**
 * History page — score trend chart + past audit list.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuditHistory } from '../hooks/useAuditHistory.js';
import { useAuditStore } from '../stores/audit-store.js';
import { getAPI } from '../lib/ipc-client.js';
import { DomainPicker } from '../components/DomainPicker.js';
import { ScoreTrend } from '../components/ScoreTrend.js';
import { AuditList } from '../components/AuditList.js';
import { Footer } from '../components/Footer.js';

interface HistoryPageProps {
  onNavigateToAudit?: () => void;
}

export function HistoryPage({ onNavigateToAudit }: HistoryPageProps) {
  const { audits, domains, trend, loading, loadAudits, loadTrend, loadDomains } = useAuditHistory();
  const loadHistorical = useAuditStore((s) => s.loadHistorical);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const handleAuditClick = useCallback(async (auditId: string) => {
    const api = getAPI();
    if (!api) return;
    const detail = await api.getAuditDetail(auditId);
    if (!detail) return;
    loadHistorical(detail.result.url, detail.result, detail.ruleMetadata);
    onNavigateToAudit?.();
  }, [loadHistorical, onNavigateToAudit]);

  // Load audits and trend when domain selection changes
  useEffect(() => {
    loadAudits(selectedDomain ?? undefined);
    if (selectedDomain) {
      loadTrend(selectedDomain);
    }
  }, [selectedDomain, loadAudits, loadTrend]);

  // Refresh domains on mount
  useEffect(() => {
    loadDomains();
  }, [loadDomains]);

  return (
    <div className="pt-[var(--header-height)] min-h-screen flex flex-col justify-between">
      <div className="max-w-[var(--content-max-width)] mx-auto p-6 space-y-6 w-full flex-1">
        {/* Header with domain picker */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            تاریخچه ممیزی‌های سئو
          </h2>
          <DomainPicker
            domains={domains}
            selected={selectedDomain}
            onChange={setSelectedDomain}
          />
        </div>

        {/* Score trend chart */}
        {selectedDomain && (
          <div
            className="p-5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>
              روند تغییرات امتیاز سئو — <span dir="ltr" className="font-mono">{selectedDomain}</span>
            </h3>
            <ScoreTrend data={trend} />
          </div>
        )}

        {/* Audit list */}
        <div
          className="p-5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            لیست ممیزی‌های انجام شده
          </h3>
          <AuditList audits={audits} loading={loading} onAuditClick={handleAuditClick} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
