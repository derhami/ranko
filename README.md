<div dir="rtl">

# 🔍 Ranko

**ابزار حرفه‌ای سئو و بهینه‌سازی سایت**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-ranko--seo-red.svg)](https://www.npmjs.com/package/ranko-seo)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/derhami/ranko/pulls)

> بخشی از [لابراتوار پروژه‌های درهمی](https://nounproject.ir)

---

## 📋 فهرست

- [درباره پروژه](#درباره-پروژه)
- [ویژگی‌ها](#ویژگی‌ها)
- [نمای کلی](#نمای-کلی)
- [نصب](#نصب)
- [استفاده سریع](#استفاده-سریع)
- [دسته‌بندی‌ها](#دسته‌بندی‌ها)
- [CLI دستورات](#cli-دستورات)
- [اپلیکیشن دسکتاپ](#اپلیکیشن-دسکتاپ)
- [پیکربندی](#پیکربندی)
- [خروجی](#خروجی)
- [یکپارچه‌سازی CI/CD](#یکپارچه‌سازی-cicd)
- [پروژه‌های مرتبط](#پروژه‌های-مرتبط)
- [مشارکت](#مشارکت)
- [مجوز](#مجوز)

---

## 🎯 درباره پروژه

**Ranko** یک ابزار جامع سئو و بهینه‌سازی سایت است که **۲۵۱ قاعده** در **۲۰ دسته مختلف** را بررسی می‌کند. این ابزار با هدف کمک به توسعه‌دهندگان وب فارسی طراحی شده تا بتوانند به سرعت و به راحتی سئوی سایت خود را بررسی و بهینه‌سازی کنند.

### چرا Ranko؟

| ویژگی | Ranko | ابزارهای مشابه |
|-------|-------|----------------|
| ۲۵۱ قاعده سئو | ✅ | ❌ محدود |
| Core Web Vitals | ✅ | ⚠️ پولی |
| خروجی LLM | ✅ | ❌ |
| آمادگی AI/GEO | ✅ | ❌ |
| متن‌باز و رایگان | ✅ | ⚠️ محدود |
| فارسی | ✅ | ❌ |

---

## ✨ ویژگی‌ها

### 🔧 قابلیت‌های اصلی

- **۲۵۱ قاعده سئو** در ۲۰ دسته مختلف
- **ابزار خط فرمان (CLI)** - بررسی تک صفحه و خزش چند صفحه
- **اپلیکیشن دسکتاپ** - داشبورد بصری با نمودار و گزارش
- **Core Web Vitals** - اندازه‌گیری LCP, CLS, FCP, TTFB, INP

### 🚀 قابلیت‌های پیشرفته

- **تحلیل رندر جاوااسکریپت** - مقایسه DOM خام و رندر شده
- **۵ فرمت خروجی** - کنسول، JSON، HTML، Markdown و LLM
- **آمادگی هوش مصنوعی** - بررسی دسترسی ربات‌های AI و llms.txt
- **تشخیص زنجیره ریدایرکت** - حلقه‌ها و ریدایرکت‌های شکسته
- **ذخیره‌سازی SQLite** - داده‌های پایدار با فشرده‌سازی

### 🎨 اپلیکیشن دسکتاپ

- پیشرفت لحظه‌ای بررسی
- نمودار امتیاز و روند
- نتایج تعاملی با فیلتر
- پشتیبانی از تم تیره و روشن

---

## 📸 نمای کلی

```
╔══════════════════════════════════════════════════════════════╗
║                    Ranko Audit Report                        ║
╚══════════════════════════════════════════════════════════════╝

URL:       https://example.com
Score:     88/100  [A]

┌──────────────────────────┬───────┬────────┬──────────┬────────┐
│ Category                 │ Score │ Passed │ Warnings │ Failed │
├──────────────────────────┼───────┼────────┼──────────┼────────┤
│ Core                     │ 97    │ 18     │ 1        │ 0      │
│ Performance              │ 85    │ 18     │ 3        │ 1      │
│ Links                    │ 92    │ 14     │ 2        │ 0      │
│ Images                   │ 78    │ 10     │ 3        │ 2      │
│ Security                 │ 95    │ 15     │ 1        │ 0      │
└──────────────────────────┴───────┴────────┴──────────┴────────┘
```

---

## 📦 نصب

### از npm (توصیه شده)

```bash
npm install -g ranko-seo
```

### از سورس

```bash
git clone https://github.com/derhami/ranko.git
cd ranko
npm install
npm run build
```

### نصب Playwright

```bash
npx playwright install chromium
```

---

## 🚀 استفاده سریع

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

---

## 📊 دسته‌بندی‌ها (۲۰ دسته)

| دسته | وزن | توضیح |
|------|-----|-------|
| **Core** | ۱۲٪ | تنظیمات اصلی سئو (title, meta, canonical, robots) |
| **Performance** | ۱۲٪ | عملکرد و سرعت بارگذاری |
| **Links** | ۸٪ | لینک‌ها و پیوندها |
| **Images** | ۸٪ | تصاویر و المان‌های بصری |
| **Security** | ۸٪ | امنیت سایت (CSP, HSTS, SSL) |
| **Technical SEO** | ۷٪ | سئوی فنی |
| **Crawlability** | ۵٪ | خزش و ایندکس‌گذاری |
| **Structured Data** | ۵٪ | داده‌های ساختاریافته (Schema.org) |
| **Content** | ۵٪ | محتوا و متن |
| **JavaScript** | ۵٪ | رندر جاوااسکریپت |
| **Accessibility** | ۴٪ | دسترسی‌پذیری (WCAG) |
| **Social** | ۳٪ | شبکه‌های اجتماعی (OG, Twitter) |
| **E-E-A-T** | ۳٪ | تجربه، تخصص، اعتبار |
| **URL Structure** | ۳٪ | ساختار URL |
| **Redirects** | ۳٪ | ریدایرکت‌ها |
| **Mobile** | ۲٪ | سازگاری موبایل |
| **i18n** | ۲٪ | بین‌المللی‌سازی |
| **HTML Validation** | ۲٪ | اعتبارسنجی HTML |
| **AI/GEO** | ۲٪ | آمادگی هوش مصنوعی |
| **Legal** | ۱٪ | م合规ی قانونی (Privacy, Terms) |

---

## 🖥️ CLI دستورات

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

---

## 🖱️ اپلیکیشن دسکتاپ

```bash
# نصب وابستگی‌ها
npm install

# اجرای دسکتاپ
npm run electron:dev

# ساخت نسخه نهایی
npm run electron:dist
```

### ویژگی‌های دسکتاپ

- 📊 **داشبورد بصری** - نمودار امتیاز و روند
- ⚡ **پیشرفت لحظه‌ای** - مشاهده روند بررسی
- 🔍 **نتایج تعاملی** - فیلتر و جستجو در نتایج
- 🎨 **تم تیره و روشن** - پشتیبانی از هر دو حالت
- 💾 **ذخیره‌سازی** - تاریخچه بررسی‌ها در SQLite

---

## ⚙️ پیکربندی

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

---

## 📤 خروجی

### فرمت‌های خروجی

| فرمت | توضیح | استفاده |
|-------|-------|---------|
| `console` | خروجی کنسول | بررسی سریع |
| `json` | JSON ساختاریافته | یکپارچه‌سازی |
| `html` | گزارش HTML | اشتراک‌گذاری |
| `markdown` | Markdown | مستندات |
| `llm` | خروجی برای AI | تحلیل هوش مصنوعی |

### خروجی نمونه (Console)

```
╔══════════════════════════════════════════════════════════════╗
║                    Ranko Audit Report                        ║
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

---

## 🔄 یکپارچه‌سازی CI/CD

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
      - uses: actions/upload-artifact@v4
        with:
          name: seo-report
          path: report.json
```

---

## 🔗 پروژه‌های مرتبط

| پروژه | توضیح | لینک |
|-------|-------|------|
| **پرشین ویراستار** | ابزار ویرایش متن فارسی | [virastar.nounproject.ir](https://virastar.nounproject.ir) |
| **چک‌لیست طراحی** | مرجع تخصصی UI/UX | [checklist.nounproject.ir](https://checklist.nounproject.ir) |
| **ویژوالایزر تیلویند** | مرجع بصری Tailwind CSS | [tailwind.nounproject.ir](https://tailwind.nounproject.ir) |

---

## 🤝 مشارکت

ما از مشارکت شما استقبال می‌کنیم!

1. Fork کنید
2. Branch جدید بسازید (`git checkout -b feature/amazing-feature`)
3. Commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request ایجاد کنید

---

## 🌐 اجرای نسخه وب (سرویس آنلاین)

علاوه بر CLI و دسکتاپ، **رنکو** شامل یک وب‌اپلیکیشن کامل است (سرور Express + رابط React) که از طریق `server.ts` اجرا می‌شود:

```bash
npm install
npm run build:web     # ساخت رابط وب → dist-electron/renderer
npm start             # اجرای سرور روی http://localhost:3000
```

- **API**: `/api/audit/run` (SSE streaming)، `/api/db/*` (تاریخچه ممیزی‌ها)، `/api/health`
- **ذخیره‌سازی**: داده‌ها در `~/.seomator/` (قابل override با `SEOMATOR_HOME`)

### دیپلوی ابری (Railway / Render / Fly.io)

پروژه شامل `Dockerfile`، `render.yaml` و `fly.toml` است:

| پلتفرم | روش |
|--------|-----|
| **Railway** | ریپو را به Railway متصل کنید — `Dockerfile` خودکار شناسایی می‌شود |
| **Render** | Blueprint موجود در `render.yaml` را متصل کنید |
| **Fly.io** | `fly launch` سپس `fly deploy` |

مهم:
- پورت مورد انتظار: `8080` (از طریق متغیر `PORT`)
- دیتابیس روی ولوم `/data` ذخیره می‌شود (`SEOMATOR_HOME=/data/seomator`) — ولوم دائمی برای بقای داده‌ها ضروری است
- Health check: `/api/health`

---

## 📄 مجوز

MIT License - مشاهده [LICENSE](./LICENSE)

---

## 👨‍💻 نویسنده

**حمیدرضا درهمی**

- 🌐 [وبسایت شخصی](https://derhami.com)
- 🐙 [گیت‌هاب](https://github.com/derhami)
- 📧 [ایمیل](mailto:hamid@derhami.com)

---

## 🏷️ برچسب‌ها

`seo` `audit` `web-vitals` `core-web-vitals` `lighthouse` `meta-tags` `structured-data` `accessibility` `technical-seo` `cli` `nodejs` `typescript`

---

<div align="center">

**لابراتوار پروژه‌های درهمی** | [nounproject.ir](https://nounproject.ir)

ساخته شده با ♥ توسط حمیدرضا درهمی

</div>

</div>
