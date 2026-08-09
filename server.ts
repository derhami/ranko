import express from 'express';
import { createServer as createViteServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Auditor } from './src/auditor.js';
import { getRuleById } from './src/rules/registry.js';
import { getCategoryById } from './src/categories/index.js';
import { AuditsDatabase } from './src/storage/audits-db/index.js';
import type { AuditResult, CategoryResult, RuleResult } from './src/types.js';
import type { RuleMetadataIpc, AuditCompletePayload } from './electron/shared/ipc-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

let currentAbortController: AbortController | null = null;

function buildRuleMetadata(result: AuditResult): Record<string, RuleMetadataIpc> {
  const metadata: Record<string, RuleMetadataIpc> = {};
  for (const cat of result.categoryResults) {
    for (const r of cat.results) {
      if (!metadata[r.ruleId]) {
        const rule = getRuleById(r.ruleId);
        metadata[r.ruleId] = {
          name: rule?.name ?? r.ruleId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          description: rule?.description ?? '',
        };
      }
    }
  }
  return metadata;
}

function saveAuditResultToDb(result: AuditResult): void {
  try {
    const db = AuditsDatabase.getInstance();
    let domain = 'unknown';
    try {
      domain = new URL(result.url).hostname;
    } catch {
      domain = result.url;
    }

    const auditId = `${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).substring(2, 8)}`;
    const created = db.createAudit({
      auditId,
      domain,
      startUrl: result.url,
    });

    const categoryInputs = result.categoryResults.map((cat) => {
      const category = getCategoryById(cat.categoryId);
      return {
        categoryId: cat.categoryId,
        categoryName: category?.name ?? (cat as any).categoryName ?? cat.categoryId,
        score: cat.score,
        weight: category?.weight ?? Math.round(100 / (result.categoryResults.length || 1)),
        passCount: cat.passCount,
        warnCount: cat.warnCount,
        failCount: cat.failCount,
      };
    });
    db.insertCategories(created.id, categoryInputs);

    let totalRules = 0;
    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;

    const resultInputs = [];
    for (const cat of result.categoryResults) {
      for (const r of cat.results) {
        totalRules++;
        if (r.status === 'pass') passCount++;
        else if (r.status === 'warn') warnCount++;
        else if (r.status === 'fail') failCount++;

        const rule = getRuleById(r.ruleId);
        resultInputs.push({
          ruleId: r.ruleId,
          categoryId: cat.categoryId,
          ruleName: rule?.name ?? r.ruleId,
          status: r.status,
          score: r.score,
          message: r.message,
          details: r.details,
        });
      }
    }

    db.insertResults(created.id, resultInputs);
    db.completeAudit(auditId, {
      overallScore: result.overallScore,
      totalRules,
      passedCount: passCount,
      warningCount: warnCount,
      failedCount: failCount,
      pagesAudited: result.crawledPages ?? 1,
    });
  } catch (err) {
    console.error('Failed to save audit result to database:', err);
  }
}

// ─── Database API Routes ───────────────────────────────────────────────────

app.get('/api/db/audits', (req, res) => {
  try {
    const db = AuditsDatabase.getInstance();
    const domain = req.query.domain as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const summaries = db.listAudits({ domain, limit, offset });
    res.json(
      summaries.map((s) => ({
        id: s.id,
        auditId: s.auditId,
        domain: s.domain,
        projectName: s.projectName,
        startUrl: s.startUrl,
        overallScore: s.overallScore,
        pagesAudited: s.pagesAudited,
        passedCount: s.passedCount,
        warningCount: s.warningCount,
        failedCount: s.failedCount,
        startedAt: s.startedAt instanceof Date ? s.startedAt.toISOString() : String(s.startedAt),
        completedAt:
          s.completedAt instanceof Date
            ? s.completedAt.toISOString()
            : s.completedAt
            ? String(s.completedAt)
            : null,
        status: s.status,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/db/score-trend', (req, res) => {
  try {
    const domain = req.query.domain as string;
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const db = AuditsDatabase.getInstance();
    const trend = db.getScoreTrend(domain, limit);

    res.json(
      trend.map((t) => ({
        auditId: t.auditId,
        score: t.score,
        date: t.date instanceof Date ? t.date.toISOString() : String(t.date),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/db/audited-domains', (_req, res) => {
  try {
    const db = AuditsDatabase.getInstance();
    res.json(db.getAuditedDomains());
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/db/audit/:id', (req, res) => {
  try {
    const db = AuditsDatabase.getInstance();
    const audit = db.getAudit(req.params.id);
    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const dbCategories = db.getCategories(audit.id);
    const dbResults = db.getResults(audit.id);

    const resultsByCategory = new Map<string, RuleResult[]>();
    for (const r of dbResults) {
      const list = resultsByCategory.get(r.categoryId) ?? [];
      list.push({
        ruleId: r.ruleId,
        status: r.status as RuleResult['status'],
        message: r.message,
        score: r.score,
        details: (r.details as Record<string, unknown>) ?? undefined,
      });
      resultsByCategory.set(r.categoryId, list);
    }

    const categoryResults: CategoryResult[] = dbCategories.map((cat) => ({
      categoryId: cat.categoryId,
      score: cat.score,
      passCount: cat.passCount,
      warnCount: cat.warnCount,
      failCount: cat.failCount,
      results: resultsByCategory.get(cat.categoryId) ?? [],
    }));

    const result: AuditResult = {
      url: audit.startUrl,
      overallScore: audit.overallScore,
      categoryResults,
      timestamp:
        audit.startedAt instanceof Date
          ? audit.startedAt.toISOString()
          : String(audit.startedAt),
      crawledPages: audit.pagesAudited,
    };

    const ruleMetadata: Record<string, RuleMetadataIpc> = {};
    for (const r of dbResults) {
      if (!ruleMetadata[r.ruleId]) {
        const rule = getRuleById(r.ruleId);
        ruleMetadata[r.ruleId] = {
          name: rule?.name ?? r.ruleName,
          description: rule?.description ?? '',
        };
      }
    }

    res.json({ result, ruleMetadata });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── Health Check Endpoint ──────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ─── Audit Runner API Routes ───────────────────────────────────────────────

app.post('/api/audit/cancel', (_req, res) => {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
  res.json({ success: true });
});

app.post('/api/audit/run', async (req, res) => {
  let { url, options = {} } = req.body || {};

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).send('آدرس اینترنتی (URL) الزامی است');
  }

  url = url.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (channel: string, payload: unknown) => {
    res.write(`data: ${JSON.stringify({ channel, payload })}\n\n`);
  };

  currentAbortController = new AbortController();

  req.on('close', () => {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
  });

  try {
    const auditor = new Auditor({
      measureCwv: options.measureCwv ?? false,
      categories: options.categories ?? [],
      onCategoryStart: (categoryId, categoryName) => {
        if (!currentAbortController?.signal.aborted) {
          sendEvent('audit:progress:category-start', { categoryId, categoryName });
        }
      },
      onCategoryComplete: (categoryId, categoryName, result) => {
        if (!currentAbortController?.signal.aborted) {
          sendEvent('audit:progress:category-complete', {
            categoryId,
            categoryName,
            result,
          });
        }
      },
      onRuleComplete: (ruleId, ruleName, result) => {
        if (!currentAbortController?.signal.aborted) {
          sendEvent('audit:progress:rule-complete', { ruleId, ruleName, result });
        }
      },
      onPageComplete: (pageUrl, pageNumber, totalPages) => {
        if (!currentAbortController?.signal.aborted) {
          sendEvent('audit:progress:page-complete', {
            url: pageUrl,
            pageNumber,
            totalPages,
          });
        }
      },
    });

    let result: AuditResult;
    if (options.crawl) {
      result = await auditor.auditWithCrawl(
        url,
        options.maxPages ?? 10,
        options.concurrency ?? 3
      );
    } else {
      result = await auditor.audit(url);
    }

    if (!currentAbortController?.signal.aborted) {
      saveAuditResultToDb(result);

      const payload: AuditCompletePayload = {
        result,
        ruleMetadata: buildRuleMetadata(result),
      };
      sendEvent('audit:complete', payload);
    }
  } catch (error) {
    if (!currentAbortController?.signal.aborted) {
      let message = error instanceof Error ? error.message : 'خطای غیرمنتظره در ممیزی سئو';
      if (message.includes('fetch failed') || message.includes('Failed to fetch') || message.includes('TypeError')) {
        message = 'امکان برقراری ارتباط با وب‌سایت مقصد وجود ندارد. لطفاً از صحت آدرس اینترنتی اطمینان حاصل کنید.';
      }
      sendEvent('audit:error', message);
    }
  } finally {
    currentAbortController = null;
    res.end();
  }
});

// ─── Vite Dev Middleware & Static Server Setup ─────────────────────────────

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(resolve(__dirname, 'dist-electron/renderer')));
    app.use((_req, res) => {
      res.sendFile(resolve(__dirname, 'dist-electron/renderer/index.html'));
    });
  } else {
    const vite = await createViteServer({
      root: resolve(__dirname, 'electron/renderer'),
      server: { middlewareMode: true },
      appType: 'spa',
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@renderer': resolve(__dirname, 'electron/renderer'),
          '@core': resolve(__dirname, 'src'),
        },
      },
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
