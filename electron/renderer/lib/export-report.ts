import type { AuditResult, CategoryResult, RuleResult } from '../../../src/types.js';
import type { RuleMetadataIpc } from '../../shared/ipc-types.js';
import { CATEGORY_NAMES_FA } from './format.js';

export function downloadJsonReport(result: AuditResult) {
  const jsonStr = JSON.stringify(result, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  let domain = 'audit';
  try {
    domain = new URL(result.url).hostname;
  } catch {
    domain = result.url.replace(/[^a-zA-Z0-9]/g, '_');
  }
  a.href = url;
  a.download = `ranko-report-${domain}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copySummaryText(result: AuditResult): Promise<boolean> {
  const totalFail = result.categoryResults.reduce((n: number, c: CategoryResult) => n + c.failCount, 0);
  const totalWarn = result.categoryResults.reduce((n: number, c: CategoryResult) => n + c.warnCount, 0);
  const totalPass = result.categoryResults.reduce((n: number, c: CategoryResult) => n + c.passCount, 0);

  let scoreEmoji = '🔴';
  if (result.overallScore >= 90) scoreEmoji = '🟢';
  else if (result.overallScore >= 70) scoreEmoji = '🟡';

  let domain = result.url;
  try {
    domain = new URL(result.url).hostname;
  } catch {
    // keep raw
  }

  const topFails: string[] = [];
  for (const cat of result.categoryResults) {
    const catFaName = CATEGORY_NAMES_FA[cat.categoryId] ?? cat.categoryId;
    for (const r of cat.results) {
      if (r.status === 'fail' && topFails.length < 5) {
        topFails.push(`• [${catFaName}] ${r.message || r.ruleId}`);
      }
    }
  }

  const summary = `📊 گزارش ممیزی سئو Ranko Pro
🌐 وب‌سایت: ${domain}
🏆 امتیاز کل: ${result.overallScore}/100 ${scoreEmoji}

📈 وضعیت قوانین:
✅ پاس شده: ${totalPass}
⚠️ هشدار: ${totalWarn}
❌ خطا: ${totalFail}
📄 صفحات بررسی شده: ${result.crawledPages}

${topFails.length > 0 ? `🚨 مهم‌ترین خطاهای نیازمند اصلاح:\n${topFails.join('\n')}\n\n` : ''}🔗 تولید شده توسط Ranko Pro (ranko.nounproject.ir)`;

  return navigator.clipboard
    .writeText(summary)
    .then(() => true)
    .catch(() => false);
}

export function generateHtmlReport(result: AuditResult, ruleMetadata?: Record<string, RuleMetadataIpc>) {
  let domain = result.url;
  try {
    domain = new URL(result.url).hostname;
  } catch {
    // keep raw
  }

  const totalFail = result.categoryResults.reduce((n: number, c: CategoryResult) => n + c.failCount, 0);
  const totalWarn = result.categoryResults.reduce((n: number, c: CategoryResult) => n + c.warnCount, 0);
  const totalPass = result.categoryResults.reduce((n: number, c: CategoryResult) => n + c.passCount, 0);

  const categoriesHtml = result.categoryResults
    .map((cat: CategoryResult) => {
      const catFaName = CATEGORY_NAMES_FA[cat.categoryId] ?? cat.categoryId;
      const rulesHtml = cat.results
        .map((r: RuleResult) => {
          const meta = ruleMetadata?.[r.ruleId];
          const name = meta?.name || r.ruleId;
          let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          let statusLabel = 'پاس شده';
          if (r.status === 'fail') {
            badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
            statusLabel = 'خطا';
          } else if (r.status === 'warn') {
            badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
            statusLabel = 'هشدار';
          }

          return `
            <div class="rule-item">
              <div class="rule-header">
                <span class="badge ${badgeClass}">${statusLabel}</span>
                <span class="rule-title">${name}</span>
                <span class="rule-id">${r.ruleId}</span>
              </div>
              <div class="rule-msg">${r.message}</div>
              ${meta?.description ? `<div class="rule-desc">${meta.description}</div>` : ''}
              ${
                r.details && Object.keys(r.details).length > 0
                  ? `<pre class="rule-details">${JSON.stringify(r.details, null, 2)}</pre>`
                  : ''
              }
            </div>
          `;
        })
        .join('');

      return `
        <div class="cat-card">
          <div class="cat-header">
            <h3>${catFaName}</h3>
            <span class="cat-score">${Math.round(cat.score)}/100</span>
          </div>
          <div class="rules-list">
            ${rulesHtml}
          </div>
        </div>
      `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>گزارش ممیزی سئو - ${domain} | Ranko Pro</title>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4f46e5;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
    }
    body {
      font-family: 'Vazirmatn', sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 32px 16px;
      direction: rtl;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #1e1b4b, #0f172a);
      color: white;
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      font-size: 24px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .score-badge {
      font-size: 42px;
      font-weight: 800;
      background: rgba(255,255,255,0.1);
      padding: 12px 24px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--card);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--border);
      text-align: center;
    }
    .stat-num {
      font-size: 24px;
      font-weight: 800;
    }
    .cat-card {
      background: var(--card);
      border-radius: 12px;
      border: 1px solid var(--border);
      margin-bottom: 20px;
      overflow: hidden;
    }
    .cat-header {
      background: #f1f5f9;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
    }
    .cat-header h3 {
      margin: 0;
      font-size: 16px;
    }
    .cat-score {
      font-weight: 700;
      color: var(--primary);
    }
    .rules-list {
      padding: 16px 20px;
    }
    .rule-item {
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .rule-item:last-child {
      border-bottom: none;
    }
    .rule-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      border: 1px solid;
    }
    .bg-emerald-100 { background: #dcfce7; color: #166534; border-color: #86efac; }
    .bg-rose-100 { background: #ffe4e6; color: #9f1239; border-color: #fca5a5; }
    .bg-amber-100 { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
    .rule-title {
      font-weight: 700;
      font-size: 14px;
    }
    .rule-id {
      font-family: monospace;
      font-size: 11px;
      color: var(--muted);
      margin-right: auto;
    }
    .rule-msg {
      font-size: 13px;
      color: #334155;
    }
    .rule-desc {
      font-size: 12px;
      color: var(--muted);
      margin-top: 4px;
    }
    .rule-details {
      font-family: monospace;
      font-size: 11px;
      background: #0f172a;
      color: #38bdf8;
      padding: 8px 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin-top: 8px;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      font-size: 12px;
      color: var(--muted);
    }
    @media print {
      body { background: white; padding: 0; }
      .header { background: #1e1b4b !important; color: white !important; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand">🚀 Ranko Pro</div>
        <p style="margin: 8px 0 0 0; opacity: 0.8; font-size: 14px;">گزارش رسمی ممیزی سئوی وب‌سایت: <strong>${domain}</strong></p>
        <p style="margin: 4px 0 0 0; opacity: 0.6; font-size: 12px;">تاریخ تولید: ${new Date().toLocaleDateString('fa-IR')}</p>
      </div>
      <div class="score-badge">${result.overallScore} <span style="font-size: 18px;">/ 100</span></div>
    </div>

    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-num" style="color: #166534;">${totalPass}</div>
        <div style="font-size: 12px; color: var(--muted);">قوانین پاس شده</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #b45309;">${totalWarn}</div>
        <div style="font-size: 12px; color: var(--muted);">هشدارها</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #9f1239;">${totalFail}</div>
        <div style="font-size: 12px; color: var(--muted);">خطاهای بحرانی</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #4f46e5;">${result.crawledPages}</div>
        <div style="font-size: 12px; color: var(--muted);">صفحات خزش شده</div>
      </div>
    </div>

    ${categoriesHtml}

    <div class="footer">
      تولید شده توسط سامانه هوشمند Ranko Pro | توسعه: <a href="https://derhami.com" target="_blank" style="text-decoration: none;">حمیدرضا درهمی</a>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ranko-report-${domain}-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPdfReport(result: AuditResult, ruleMetadata?: Record<string, RuleMetadataIpc>) {
  let domain = result.url;
  try {
    domain = new URL(result.url).hostname;
  } catch {
    // keep raw
  }

  const totalFail = result.categoryResults.reduce((n: number, c: CategoryResult) => n + c.failCount, 0);
  const totalWarn = result.categoryResults.reduce((n: number, c: CategoryResult) => n + c.warnCount, 0);
  const totalPass = result.categoryResults.reduce((n: number, c: CategoryResult) => n + c.passCount, 0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('پنجره چاپ مسدود شد. لطفا مجوز Popup را صادر کنید.');
    return;
  }

  const categoriesHtml = result.categoryResults
    .map((cat: CategoryResult) => {
      const catFaName = CATEGORY_NAMES_FA[cat.categoryId] ?? cat.categoryId;
      const rulesHtml = cat.results
        .map((r: RuleResult) => {
          const meta = ruleMetadata?.[r.ruleId];
          const name = meta?.name || r.ruleId;
          let badgeClass = 'badge-pass';
          let statusLabel = 'پاس شده';
          if (r.status === 'fail') {
            badgeClass = 'badge-fail';
            statusLabel = 'خطا';
          } else if (r.status === 'warn') {
            badgeClass = 'badge-warn';
            statusLabel = 'هشدار';
          }

          return `
            <div class="rule-item">
              <div class="rule-header">
                <span class="badge ${badgeClass}">${statusLabel}</span>
                <span class="rule-title">${name}</span>
              </div>
              <div class="rule-msg">${r.message}</div>
              ${meta?.description ? `<div class="rule-desc">${meta.description}</div>` : ''}
            </div>
          `;
        })
        .join('');

      return `
        <div class="cat-card">
          <div class="cat-header">
            <h3>${catFaName}</h3>
            <span class="cat-score">امتیاز: ${Math.round(cat.score)} / ۱۰ </span>
          </div>
          <div class="rules-list">
            ${rulesHtml}
          </div>
        </div>
      `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>گزارش PDF ممیزی سئو - ${domain}</title>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: 'Vazirmatn', sans-serif;
      background: #ffffff;
      color: #0f172a;
      margin: 0;
      padding: 0;
      direction: rtl;
    }
    .toolbar {
      background: #1e293b;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .toolbar button {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-family: 'Vazirmatn', sans-serif;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }
    .container {
      max-width: 800px;
      margin: 20px auto;
      padding: 0 16px;
    }
    .header {
      background: linear-gradient(135deg, #1e1b4b, #312e81);
      color: white;
      padding: 24px 32px;
      border-radius: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .score-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #4f46e5;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(79,70,229,0.3);
    }
    .score-circle span {
      font-size: 10px;
      opacity: 0.8;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      background: #f8fafc;
    }
    .stat-num {
      font-size: 20px;
      font-weight: 800;
    }
    .cat-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .cat-header {
      background: #f1f5f9;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      border-bottom: 1px solid #e2e8f0;
    }
    .rules-list {
      padding: 12px 16px;
    }
    .rule-item {
      padding: 8px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .rule-item:last-child {
      border-bottom: none;
    }
    .rule-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .badge-pass { background: #dcfce7; color: #15803d; }
    .badge-warn { background: #fef3c7; color: #b45309; }
    .badge-fail { background: #ffe4e6; color: #be123c; }
    .rule-title { font-weight: 700; font-size: 13px; }
    .rule-msg { font-size: 12px; color: #334155; }
    .rule-desc { font-size: 11px; color: #64748b; margin-top: 2px; }
    @media print {
      .toolbar { display: none !important; }
      .container { max-width: 100%; margin: 0; padding: 0; }
      body { -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>پیش‌نمایش چاپ و ذخیره به عنوان PDF</span>
    <button onclick="window.print()">ذخیره به عنوان PDF / پرینت 🖨️</button>
  </div>
  <div class="container">
    <div class="header">
      <div>
        <h1 style="margin:0; font-size: 22px;">گزارش ممیزی سئو (Ranko Pro)</h1>
        <p style="margin: 6px 0 0; opacity: 0.85; font-size: 13px;">دامنه: ${domain}</p>
        <p style="margin: 2px 0 0; opacity: 0.7; font-size: 11px;">تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p>
      </div>
      <div class="score-circle">
        ${result.overallScore}
        <span>از ۱۰۰</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num" style="color: #15803d;">${totalPass}</div>
        <div style="font-size: 11px; color: #64748b;">قوانین پاس شده</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #b45309;">${totalWarn}</div>
        <div style="font-size: 11px; color: #64748b;">هشدارها</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #be123c;">${totalFail}</div>
        <div style="font-size: 11px; color: #64748b;">خطاهای نیازمند اصلاح</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #4f46e5;">${result.crawledPages}</div>
        <div style="font-size: 11px; color: #64748b;">صفحات بررسی شده</div>
      </div>
    </div>

    ${categoriesHtml}
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}


