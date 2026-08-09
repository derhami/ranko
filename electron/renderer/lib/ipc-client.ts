/**
 * Typed wrapper around window.electronAPI exposed by the preload script.
 * Returns a web API fallback when running outside Electron (e.g., standard browser on port 3000).
 */

import type { ElectronAPI } from '../../preload/index.js';
import type {
  AuditRunArgs,
  AuditProgressCategoryStart,
  AuditProgressCategoryComplete,
  AuditProgressRuleComplete,
  AuditProgressPageComplete,
  AuditCompletePayload,
  DbListAuditsArgs,
  DbScoreTrendArgs,
  AuditSummaryIpc,
  ScoreTrendPoint,
  AuditDetailIpc,
} from '../../shared/ipc-types.js';

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

type EventCallbackMap = {
  categoryStart: Set<(data: AuditProgressCategoryStart) => void>;
  categoryComplete: Set<(data: AuditProgressCategoryComplete) => void>;
  ruleComplete: Set<(data: AuditProgressRuleComplete) => void>;
  pageComplete: Set<(data: AuditProgressPageComplete) => void>;
  auditComplete: Set<(payload: AuditCompletePayload) => void>;
  auditError: Set<(message: string) => void>;
};

const listeners: EventCallbackMap = {
  categoryStart: new Set(),
  categoryComplete: new Set(),
  ruleComplete: new Set(),
  pageComplete: new Set(),
  auditComplete: new Set(),
  auditError: new Set(),
};

let activeAbortController: AbortController | null = null;

function createWebAPI(): ElectronAPI {
  return {
    runAudit: (args: AuditRunArgs) => {
      if (activeAbortController) {
        activeAbortController.abort();
      }
      activeAbortController = new AbortController();

      fetch('/api/audit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
        signal: activeAbortController.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP error ${response.status}`);
          }
          if (!response.body) {
            throw new Error('ReadableStream not supported in response');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() ?? '';

            for (const chunk of lines) {
              const dataLine = chunk
                .split('\n')
                .find((line) => line.startsWith('data: '));
              if (!dataLine) continue;

              try {
                const eventData = JSON.parse(dataLine.slice(6));
                const { channel, payload } = eventData;

                switch (channel) {
                  case 'audit:progress:category-start':
                    listeners.categoryStart.forEach((cb) => cb(payload));
                    break;
                  case 'audit:progress:category-complete':
                    listeners.categoryComplete.forEach((cb) => cb(payload));
                    break;
                  case 'audit:progress:rule-complete':
                    listeners.ruleComplete.forEach((cb) => cb(payload));
                    break;
                  case 'audit:progress:page-complete':
                    listeners.pageComplete.forEach((cb) => cb(payload));
                    break;
                  case 'audit:complete':
                    listeners.auditComplete.forEach((cb) => cb(payload));
                    break;
                  case 'audit:error':
                    listeners.auditError.forEach((cb) => cb(payload));
                    break;
                }
              } catch (e) {
                console.error('Failed to parse SSE event:', e);
              }
            }
          }
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          let msg = err instanceof Error ? err.message : 'خطای نا مشخص در شبکه';
          if (msg === 'Failed to fetch' || msg.toLowerCase().includes('fetch failed')) {
            msg = 'امکان برقراری ارتباط با سرور ممیزی وجود ندارد. لطفاً اتصال شبکه را بررسی کنید.';
          }
          listeners.auditError.forEach((cb) => cb(msg));
        })
        .finally(() => {
          activeAbortController = null;
        });
    },

    cancelAudit: () => {
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
      }
      fetch('/api/audit/cancel', { method: 'POST' }).catch(() => {});
    },

    onCategoryStart: (cb) => {
      listeners.categoryStart.add(cb);
      return () => listeners.categoryStart.delete(cb);
    },
    onCategoryComplete: (cb) => {
      listeners.categoryComplete.add(cb);
      return () => listeners.categoryComplete.delete(cb);
    },
    onRuleComplete: (cb) => {
      listeners.ruleComplete.add(cb);
      return () => listeners.ruleComplete.delete(cb);
    },
    onPageComplete: (cb) => {
      listeners.pageComplete.add(cb);
      return () => listeners.pageComplete.delete(cb);
    },
    onAuditComplete: (cb) => {
      listeners.auditComplete.add(cb);
      return () => listeners.auditComplete.delete(cb);
    },
    onAuditError: (cb) => {
      listeners.auditError.add(cb);
      return () => listeners.auditError.delete(cb);
    },

    listAudits: async (args) => {
      try {
        const params = new URLSearchParams();
        if (args?.domain) params.set('domain', args.domain);
        if (args?.limit) params.set('limit', String(args.limit));
        if (args?.offset) params.set('offset', String(args.offset));
        const res = await fetch(`/api/db/audits?${params.toString()}`);
        if (!res.ok) return [];
        return await res.json();
      } catch (err) {
        console.warn('Failed to list audits:', err);
        return [];
      }
    },

    getScoreTrend: async (args) => {
      try {
        const params = new URLSearchParams({ domain: args.domain });
        if (args.limit) params.set('limit', String(args.limit));
        const res = await fetch(`/api/db/score-trend?${params.toString()}`);
        if (!res.ok) return [];
        return await res.json();
      } catch (err) {
        console.warn('Failed to get score trend:', err);
        return [];
      }
    },

    getAuditedDomains: async () => {
      try {
        const res = await fetch('/api/db/audited-domains');
        if (!res.ok) return [];
        return await res.json();
      } catch (err) {
        console.warn('Failed to get audited domains:', err);
        return [];
      }
    },

    getAuditDetail: async (auditId) => {
      try {
        const res = await fetch(`/api/db/audit/${encodeURIComponent(auditId)}`);
        if (!res.ok) return null;
        return await res.json();
      } catch (err) {
        console.warn('Failed to get audit detail:', err);
        return null;
      }
    },
  };
}

let webApiInstance: ElectronAPI | null = null;

export function getAPI(): ElectronAPI {
  if (window.electronAPI) {
    return window.electronAPI;
  }
  if (!webApiInstance) {
    webApiInstance = createWebAPI();
  }
  return webApiInstance;
}

