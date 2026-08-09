# Ranko - ابزار حرفه‌ای سئو

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)

**Ranko یک ابزار جامع سئو و بهینه‌سازی سایت است که ۲۵۱ قاعده در ۲۰ دسته مختلف را بررسی می‌کند.**

> بخشی از [لابراتوار پروژه‌های درهمی](https://nounproject.ir)

## ویژگی‌ها

- **۲۵۱ قاعده سئو** در ۲۰ دسته مختلف
- **ابزار خط فرمان (CLI)** - بررسی تک صفحه و خزش چند صفحه
- **اپلیکیشن دسکتاپ** - داشبورد بصری با نمودار و گزارش
- **Core Web Vitals** - اندازه‌گیری LCP, CLS, FCP, TTFB, INP
- **تحلیل رندر جاوااسکریپت** - مقایسه DOM خام و رندر شده
- **۵ فرمت خروجی** - کنسول، JSON، HTML، Markdown و LLM
- **آمادگی هوش مصنوعی** - بررسی دسترسی ربات‌های AI و llms.txt
- **تشخیص زنجیره ریدایرکت** - حلقه‌ها و ریدایرکت‌های شکسته
- **ذخیره‌سازی SQLite** - داده‌های پایدار با فشرده‌سازی

## نصب

### از npm (توصیه شده)

```bash
npm install -g ranko-seo
ranko audit https://example.com
```

### از سورس

```bash
git clone https://github.com/derhami/ranko.git
cd ranko
npm install
npm run build
./dist/cli.js audit https://example.com
```

## استفاده سریع

```bash
# بررسی پایه
ranko audit https://example.com

# بدون اندازه‌گیری Core Web Vitals (سریع‌تر)
ranko audit https://example.com --no-cwv

# بررسی دسته‌های خاص
ranko audit https://example.com -c core,security,perf

# خروجی JSON
ranko audit https://example.com --format json

# گزارش HTML
ranko audit https://example.com --format html -o report.html

# خروجی برای هوش مصنوعی
ranko audit https://example.com --format llm --no-cwv

# خزش چند صفحه
ranko audit https://example.com --crawl --max-pages 20
```

## دسته‌بندی‌ها (۲۰ دسته)

| دسته | وزن | توضیح |
|------|-----|-------|
| Core | ۱۲٪ | تنظیمات اصلی سئو |
| Performance | ۱۲٪ | عملکرد و سرعت |
| Links | ۸٪ | لینک‌ها و پیوندها |
| Images | ۸٪ | تصاویر و المان‌های بصری |
| Security | ۸٪ | امنیت سایت |
| Technical SEO | ۷٪ | سئوی فنی |
| Crawlability | ۵٪ | خزش و ایندکس‌گذاری |
| Structured Data | ۵٪ | داده‌های ساختاریافته |
| Content | ۵٪ | محتوا و متن |
| JavaScript | ۵٪ | رندر جاوااسکریپت |
| Accessibility | ۴٪ | دسترسی‌پذیری |
| Social | ۳٪ | شبکه‌های اجتماعی |
| E-E-A-T | ۳٪ | تجربه، تخصص، اعتبار |
| URL Structure | ۳٪ | ساختار URL |
| Redirects | ۳٪ | ریدایرکت‌ها |
| Mobile | ۲٪ | سازگاری موبایل |
| i18n | ۲٪ | بین‌المللی‌سازی |
| HTML Validation | ۲٪ | اعتبارسنجی HTML |
| AI/GEO | ۲٪ | آمادگی هوش مصنوعی |
| Legal | ۱٪ | م合规ی قانونی |

## اپلیکیشن دسکتاپ

```bash
# نصب وابستگی‌ها
npm install

# اجرای دسکتاپ
npm run electron:dev

# ساخت نسخه نهایی
npm run electron:dist
```

### ویژگی‌های دسکتاپ

- پیشرفت لحظه‌ای بررسی
- نمودار امتیاز و روند
- نتایج تعاملی با فیلتر
- پشتیبانی از تم تیره و روشن

## CLI دستورات

| دستور | توضیح |
|-------|-------|
| `ranko audit <url>` | بررسی سئوی URL |
| `ranko init` | ایجاد فایل پیکربندی |
| `ranko crawl <url>` | خزش سایت |
| `ranko analyze [id]` | تحلیل داده‌های ذخیره شده |
| `ranko report` | مشاهده گزارش‌ها |
| `ranko config` | مدیریت پیکربندی |
| `ranko db` | مدیریت پایگاه داده |
| `ranko self doctor` | عیب‌یابی سیستم |

## پیکربندی

فایل `ranko.toml` ایجاد کنید:

```toml
[project]
name = "my-website"
domains = ["example.com"]

[crawler]
max_pages = 100
concurrency = 3
timeout_ms = 30000

[rules]
enable = ["*"]
disable = ["perf-inp"]
```

## خروجی

### خروجی کنسول

```
╔══════════════════════════════════════════════════════════════╗
║  Ranko Audit Report                                         ║
╚══════════════════════════════════════════════════════════════╝

URL:       https://example.com
Score:     88/100  [A]

┌──────────────────────────┬───────┬────────┬──────────┬────────┐
│ Category                 │ Score │ Passed │ Warnings │ Failed │
├──────────────────────────┼───────┼────────┼──────────┼────────┤
│ Core                     │ 97    │ 18     │ 1        │ 0      │
│ Performance              │ 85    │ 18     │ 3        │ 1      │
└──────────────────────────┴───────┴────────┴──────────┴────────┘
```

## یکپارچه‌سازی CI/CD

### GitHub Actions

```yaml
name: SEO Audit
on:
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g ranko-seo
      - run: npx playwright install chromium
      - run: ranko audit https://your-site.com --format json -o report.json
```

## پروژه‌های مرتبط

- [ویراستار فارسی](https://virastar.nounproject.ir) - ویرایش و نظافت متن فارسی
- [چک‌لیست طراحی](https://checklist.nounproject.ir) - مرجع تخصصی UI/UX
- [ویژوالایزر تیلویند](https://tailwind.nounproject.ir) - مرجع بصری Tailwind CSS

## مجوز

MIT License - مشاهده [LICENSE](./LICENSE)

## نویسنده

حمیدرضا درهمی - [derhami.com](https://derhami.com)

---

**لابراتوار پروژه‌های درهمی** | [nounproject.ir](https://nounproject.ir)
