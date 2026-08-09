/**
 * Formatting utilities extracted from src/reporters/html-reporter.ts
 * Used across all dashboard components for consistent score display.
 */

export const CATEGORY_NAMES_FA: Record<string, string> = {
  core: 'سئوی پایه (Core SEO)',
  technical: 'سئوی فنی (Technical SEO)',
  perf: 'کارایی و سرعت (Performance)',
  links: 'لینک‌ها و پیوندها',
  images: 'بهینه‌سازی تصاویر',
  security: 'امنیت وب‌سایت',
  crawl: 'خزنده‌پذیری (Crawlability)',
  schema: 'داده‌های ساختاریافته (Schema)',
  a11y: 'دسترس‌پذیری (Accessibility)',
  content: 'کیفیت محتوا',
  social: 'شبکه‌های اجتماعی',
  eeat: 'اعتبار و اعتماد (E-E-A-T)',
  url: 'ساختار آدرس (URL)',
  mobile: 'واکنش‌گرایی موبایل',
  i18n: 'چندزبانه بودن (i18n)',
  legal: 'قوانین و حریم خصوصی',
  js: 'رندر جاوااسکریپت',
  redirect: 'تغییر مسیرها (Redirects)',
  htmlval: 'اعتبارسنجی کدهای HTML',
  geo: 'سئوی هوش مصنوعی (AI/GEO)',
};

export function getScoreColor(score: number): string {
  if (score >= 90) return 'var(--color-pass)';
  if (score >= 70) return 'var(--color-warn)';
  if (score >= 50) return 'var(--color-orange)';
  return 'var(--color-fail)';
}

export function getScoreColorClass(score: number): string {
  if (score >= 90) return 'text-pass';
  if (score >= 70) return 'text-warn';
  if (score >= 50) return 'text-[var(--color-orange)]';
  return 'text-fail';
}

export function getScoreBgClass(score: number): string {
  if (score >= 90) return 'bg-pass-bg';
  if (score >= 70) return 'bg-warn-bg';
  if (score >= 50) return 'bg-[var(--color-warn-bg)]';
  return 'bg-fail-bg';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'عالی';
  if (score >= 70) return 'خوب';
  if (score >= 50) return 'نیازمند بهبود';
  return 'ضعیف';
}

export function formatRuleIdAsName(ruleId: string): string {
  return ruleId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getStatusIcon(status: 'pass' | 'warn' | 'fail'): string {
  switch (status) {
    case 'pass': return '\u2713';
    case 'warn': return '!';
    case 'fail': return '\u2717';
  }
}

export function getStatusColorClass(status: 'pass' | 'warn' | 'fail'): string {
  switch (status) {
    case 'pass': return 'text-pass';
    case 'warn': return 'text-warn';
    case 'fail': return 'text-fail';
  }
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
