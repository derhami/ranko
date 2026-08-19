/**
 * Ranko landing page — minimal marketing page shown on the web build (outside Electron).
 * Self-contained, zero new dependencies. Forces dark canvas for a consistent premium look.
 */

import { useEffect, useRef, useState, type FormEvent, type ReactNode, type CSSProperties } from 'react';

interface LandingPageProps {
  onStart: (url: string) => void;
  onOpenApp: () => void;
}

const ACCENT = '#ff8d64';

/* ─── Small inline icon set (stroke based, 24px) ─────────────────────────── */

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d={d} />
    </svg>
  );
}

const I = {
  arrow: 'M19 12H5m7 7-7-7 7-7',
  terminal: 'M4 17l6-6-6-6M12 19h8',
  activity: 'M22 12h-4l-3 9L9 3l-3 6H2',
  layers: 'm12 2 10 6-10 6L2 8 12 2 10 6-10 6 10 6Z',
  wrench: 'M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18a2 2 0 1 0 2.8 2.8l5.7-5.7a4.5 4.5 0 0 0 6-6L14.7 8.7a1.3 1.3 0 0 1 0-1.8Z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  check: 'M20 6 9 17l-5-5',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35',
  sparkle: 'M12 3v3M12 18v3M5.6 5.6 2.1 2.1M16.3 16.3 18.4 18.4M3 12h3M18 12h3M4.2 19.8 6.3 17.7M17.7 6.3 19.8 4.2',
  cpu: 'M9 9h6v6H9zM4 9h1M4 15h1M19 9h1M19 15h1M9 4v1M15 4v1M9 19v1M15 19v1M12 12h.01',
  github:
    'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97 0 1.95.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.26 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z',
};

/* ─── Shared bits ────────────────────────────────────────────────────────── */

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  };
  return { ref, onMouseMove };
}

function GlowCard({ className = '', children, style }: { className?: string; children: ReactNode; style?: CSSProperties }) {
  const { ref, onMouseMove } = useTilt();
  return (
    <div ref={ref} onMouseMove={onMouseMove} style={style} className={`relative overflow-hidden ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(340px circle at var(--mx,50%) var(--my,50%), rgba(255,141,100,0.10), transparent 60%)',
        }}
      />
      {children}
    </div>
  );
}

const urlToAudit = (raw: string) => {
  let u = raw.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
};

const CATEGORIES = [
  'core', 'perf', 'links', 'images', 'security', 'technical', 'crawl', 'schema',
  'content', 'js', 'a11y', 'social', 'eeat', 'url', 'redirect', 'mobile',
  'i18n', 'htmlval', 'geo', 'legal',
];

/* ─── Sections ───────────────────────────────────────────────────────────── */

function OfflineNotice({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="mt-4 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-right">
      <p className="text-[13px] font-bold text-zinc-200 mb-1.5">موتور آنالیز آنلاین الان در دسترس نیست</p>
      <p className="text-[12px] leading-relaxed text-zinc-400 mb-2.5">
        برای اجرای ممیزی، از اپ دسکتاپ یا نسخه خط فرمان استفاده کن — خروجی‌ها دقیقاً یکسان است.
      </p>
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/derhami/ranko"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-zinc-950"
          style={{ background: `linear-gradient(120deg, ${ACCENT}, #ff7a4a)` }}
        >
          گیت‌هاب
        </a>
        <a
          href="https://www.npmjs.com/package/@seomator/seo-audit"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg px-3 py-1.5 text-[11px] font-bold border border-white/10 bg-white/5 text-zinc-200"
        >
          npx @seomator/seo-audit
        </a>
      </div>
    </div>
  );
}

function Hero({ onStart, serverOk }: { onStart: (url: string) => void; serverOk: boolean | null }) {
  const [value, setValue] = useState('');
  const [offline, setOffline] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const u = urlToAudit(value);
    if (!u) return;
    if (serverOk === false) {
      setOffline(true);
      return;
    }
    setOffline(false);
    onStart(u);
  };

  return (
    <section className="relative" id="start">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto pt-24 sm:pt-32 pb-16 px-4">
        {/* Pill */}
        <div className="hero-rise inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-[12px] font-bold text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
          ۲۵۱ قانون · ۲۰ دسته · کاملاً رایگان
          <span className="text-zinc-500">/</span>
          <span className="font-mono text-[11px] tracking-tight text-zinc-400" dir="ltr">open source</span>
        </div>

        {/* Headline */}
        <h1 className="hero-rise hero-rise-1 mt-7 text-[2.6rem] leading-[1.15] sm:text-6xl font-black tracking-tighter">
          سئوی سایتت را
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(120deg, ${ACCENT}, #ffb38e 55%, #ffd9c4)` }}>
            در چند دقیقه
          </span>{' '}
          بسنج
        </h1>

        <p className="hero-rise hero-rise-2 mt-6 text-lg text-zinc-400 max-w-xl leading-relaxed">
          رنکو ۲۵۱ فاکتور فنی، محتوایی و کارایی را بررسی می‌کند و با یک نمره و راهکارِ مشخص، نشانت
          می‌دهد چه چیزی را باید اصلاح کنی.
        </p>

        {/* URL bar */}
        <form onSubmit={submit} className="hero-rise hero-rise-3 mt-9 w-full max-w-xl flex gap-2">
          <div className="flex-1 relative">
            <Icon d={I.search} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="آدرس سایتت را بده؛ مثلاً example.com"
              dir="ltr"
              className="w-full rounded-2xl bg-white/5 border border-white/10 pl-4 pr-10 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 placeholder:text-right focus:outline-none focus:border-white/25 transition-colors text-left"
            />
          </div>
          <button
            type="submit"
            disabled={!value.trim()}
            className="rounded-2xl px-6 py-3.5 text-sm font-bold text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-95 whitespace-nowrap"
            style={{ background: `linear-gradient(120deg, ${ACCENT}, #ff7a4a)` }}
          >
            آنالیز کن
          </button>
        </form>

        <OfflineNotice show={offline} />

        <p className="hero-rise hero-rise-3 mt-3 text-xs text-zinc-500">
          نتیجهی ممیزی در همین مرورگر اجرا و نشان داده میشود — بدون ثبتنام، بدون محدودیت.
        </p>

        {/* Stat strip */}
        <div className="hero-rise hero-rise-4 mt-10 w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/5 divide-x-reverse rounded-2xl border border-white/10 bg-white/[0.03]">
          <Stat n="۲۵۱" l="قانون سئو" />
          <Stat n="۲۰" l="دسته تخصصی" />
          <Stat n="CWV" l="Core Web Vitals" />
          <Stat n="0$" l="هزینه، رایگان" />
        </div>
      </div>

      {/* Report preview */}
      <div className="hero-rise hero-rise-5 px-4 pb-10 max-w-4xl mx-auto">
        <div className="relative rounded-[1.6rem] border border-white/10 bg-[#0d0d10]/90 p-6 sm:p-8 overflow-hidden" style={{ boxShadow: '0 40px 90px -40px rgba(255,141,100,0.35)' }}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#ff8d64]/60 to-transparent" />
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Mini score ring */}
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" strokeLinecap="round"
                  stroke={`url(#ring-grad)`} strokeWidth="8" strokeDasharray="264" strokeDashoffset="38"
                />
                <defs>
                  <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={ACCENT} />
                    <stop offset="100%" stopColor="#ffb38e" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-black tracking-tight">۸۶</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-0.5">نمره سئو</div>
                </div>
              </div>
            </div>

            {/* Pills + bars */}
            <div className="flex-1 w-full min-w-0">
              <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-mono text-zinc-500" dir="ltr">ranko.nounproject.ir</span>
                <div className="flex gap-1.5">
                  <Pill color="#10b981" label="پاس" value="۲۱۴" />
                  <Pill color="#f59e0b" label="هشدار" value="۲۹" />
                  <Pill color="#ef4444" label="خطا" value="۸" />
                </div>
              </div>
              <div className="space-y-2">
                <Bar label="فنی" w="94%" c="#ff8d64" />
                <Bar label="محتوا" w="81%" c="#ffb38e" />
                <Bar label="سرعت" w="66%" c="#ffcf9c" />
                <Bar label="اسکیما" w="73%" c="#ffdfc4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="px-4 py-5">
      <div className="text-2xl font-black tracking-tight text-zinc-50" dir="ltr">{n}</div>
      <div className="text-[11px] font-bold text-zinc-500 mt-1">{l}</div>
    </div>
  );
}

function Pill({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/5 border border-white/10">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-zinc-300">{label}</span>
      <span className="font-mono text-zinc-400" dir="ltr">{value}</span>
    </span>
  );
}

function Bar({ label, w, c }: { label: string; w: string; c: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-[11px] font-bold text-zinc-500">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: w, background: `linear-gradient(90deg, ${c}66, ${c})` }} />
      </div>
      <span className="w-9 shrink-0 font-mono text-[10px] text-zinc-500 text-left" dir="ltr">{w}</span>
    </div>
  );
}

const FEATURES: { icon: string; title: string; desc: string; ltr?: string }[] = [
  {
    icon: I.terminal,
    title: 'جای‌به‌جای در دسترس',
    desc: 'در مرورگر، خط فرمان با npx و اپ دسکتاپ الکترون؛ هر سه نسخه، خروجی یکسان می‌دهند.',
    ltr: '@seomator/seo-audit',
  },
  {
    icon: I.activity,
    title: 'Core Web Vitals',
    desc: 'LCP، INP و CLS را در مرورگر واقعی اندازه می‌گیرد تا سرعت و تجربه‌ی کاربر را دقیق بدانی.',
  },
  {
    icon: I.layers,
    title: '۲۰ دسته‌بندی تخصصی',
    desc: 'از فنی و محتوا تا اسکیما، امنیت، دسترس‌پذیری و حقوقی؛ هر دسته وزن‌دار و قابل رصد.',
  },
  {
    icon: I.wrench,
    title: 'راهکار اصلاحی مشخص',
    desc: 'هر خطا همراه توضیح ساده و راه‌حل دقیق؛ دقیقاً بدان چه چیزی را عوض کنی و چرا.',
  },
  {
    icon: I.file,
    title: 'گزارش همه‌جانبه',
    desc: 'خروجی HTML برای چاپ و اشتراک، JSON برای خودکارسازی و Markdown آماده برای هوش مصنوعی.',
  },
  {
    icon: I.cpu,
    title: 'خزش هوشمند سایت',
    desc: 'کامل بخزد تا صفحه‌به‌صفحه؛ با کنترل همزمانی و حداکثر تعداد صفحات در گزارش نهایی.',
  },
];

function Features() {
  return (
    <section id="features" className="max-w-5xl mx-auto px-4 py-20">
      <SectionHeading kicker="چرا رنکو" title="یک ابزار، همه‌ی چک‌ها" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {FEATURES.map((f) => (
          <div key={f.title} className="group h-full">
            <GlowCard className="h-full rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10 text-[#ffb38e] bg-white/5 mb-4">
                <Icon d={f.icon} className="w-[18px] h-[18px]" />
              </div>
              <h3 className="text-[15px] font-black tracking-tight text-zinc-100">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">{f.desc}</p>
              {f.ltr && (
                <div className="mt-3 font-mono text-[11px] text-zinc-500 bg-black/30 rounded-lg px-2.5 py-1.5 inline-block" dir="ltr">
                  {f.ltr}
                </div>
              )}
            </GlowCard>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="text-center mb-10">
      <div className="text-[12px] font-black tracking-wide text-[#ff8d64] mb-2">{kicker}</div>
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-50">{title}</h2>
    </div>
  );
}

const STEPS: { t: string; d: string }[] = [
  { t: 'آدرس را وارد کن', d: 'یک لینک بده؛ یا خزش کامل بگیر تا کل سایت بررسی شود.' },
  { t: '۲۵۱ قانون اجرا می‌شود', d: 'همه‌ی دسته‌ها موازی و وزنی اجرا می‌شوند و روی صفحه استریم می‌شوند.' },
  { t: 'نمره و راهکار بگیر', d: 'گزارش کامل با اولویت اصلاحات؛ HTML، JSON یا Markdown.' },
];

function HowItWorks() {
  return (
    <section id="how" className="max-w-5xl mx-auto px-4 py-20">
      <SectionHeading kicker="چطور کار می‌کند" title="فقط سه قدم" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {STEPS.map((s, i) => (
          <div key={s.t} className="relative rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5">
            <span className="absolute top-5 left-5 font-mono text-2xl font-black text-white/10" dir="ltr">
              0{i + 1}
            </span>
            <div className="flex items-center gap-2 mb-2">
              {i < 2 && <Icon d={I.arrow} className="w-3.5 h-3.5 rotate-180 text-zinc-600" />}
              <h3 className="text-[15px] font-black tracking-tight text-zinc-100">{s.t}</h3>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-400">{s.d}</p>
          </div>
        ))}
      </div>

      {/* category strip */}
      <div className="mt-14">
        <div className="text-center text-[11px] font-black tracking-wide text-zinc-500 mb-5">
          ۲۰ دسته ای که می‌سنجد:
        </div>
        <div className="flex flex-wrap justify-center gap-1.5 max-w-2xl mx-auto">
          {CATEGORIES.map((c) => (
            <span key={c} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] font-mono text-[10px] text-zinc-500" dir="ltr">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ onStart, onOpenApp, serverOk }: { onStart: (url: string) => void; onOpenApp: () => void; serverOk: boolean | null }) {
  const [value, setValue] = useState('');
  const [offline, setOffline] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const u = urlToAudit(value);
    if (!u) return;
    if (serverOk === false) {
      setOffline(true);
      return;
    }
    setOffline(false);
    onStart(u);
  };
  return (
    <section className="px-4 pb-24 pt-6">
      <div className="relative max-w-3xl mx-auto rounded-[2rem] border border-white/10 overflow-hidden text-center py-16 px-6" style={{ backgroundColor: '#0d0d10', boxShadow: '0 40px 120px -50px rgba(255,141,100,0.5)' }}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#ff8d64]/70 to-transparent" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[26rem] h-[26rem] rounded-full opacity-40 blur-[110px]" style={{ background: ACCENT }} />
        <div className="relative">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tighter text-zinc-50">
            رایگان. همین الان شروع کن.
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base max-w-md mx-auto">
            بدون ثبت‌نام، بدون کارت، بدون محدودیت. کدش متن‌باز است و هیچ‌کجا نگهداری نمی‌شود جز روی سرور تو.
          </p>
          <form onSubmit={submit} className="mt-7 flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="example.com"
              dir="ltr"
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-white/25 transition-colors text-left"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="rounded-xl px-5 py-3 text-sm font-bold text-zinc-950 disabled:opacity-40 transition-transform active:scale-95"
              style={{ background: `linear-gradient(120deg, ${ACCENT}, #ff7a4a)` }}
            >
              آنالیز کن
            </button>
          </form>
          <div className="mt-4">
            <OfflineNotice show={offline} />
          </div>
          <a onClick={onOpenApp} href="#" className="inline-block mt-5 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors">
            یا مستقیم وارد ابزار شو ←
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────────── */

export function LandingPage({ onStart, onOpenApp }: LandingPageProps) {
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute('data-theme');
    root.setAttribute('data-theme', 'dark');
    return () => {
      if (prev) root.setAttribute('data-theme', prev);
      else root.removeAttribute('data-theme');
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    fetch('/api/health', { signal: controller.signal })
      .then((res) => {
        if (isMounted) setServerOk(res.ok);
      })
      .catch(() => {
        if (isMounted) setServerOk(false);
      })
      .finally(() => clearTimeout(timer));
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 relative overflow-hidden" style={{ fontFamily: 'var(--font-sans)' }}>
      <style>{`
        .hero-rise { opacity: 0; transform: translateY(16px); animation: rise .7s cubic-bezier(.22,1,.36,1) forwards; }
        .hero-rise-1 { animation-delay: .06s } .hero-rise-2 { animation-delay: .12s }
        .hero-rise-3 { animation-delay: .18s } .hero-rise-4 { animation-delay: .26s }
        .hero-rise-5 { animation-delay: .34s }
        @keyframes rise { to { opacity: 1; transform: translateY(0) } }
      `}</style>

      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -right-40 w-[34rem] h-[34rem] rounded-full blur-[140px] opacity-30" style={{ background: ACCENT }} />
        <div className="absolute -bottom-52 -left-40 w-[36rem] h-[36rem] rounded-full blur-[150px] opacity-20" style={{ background: '#1abcfe' }} />
      </div>

      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a
            href="#start"
            className="flex items-center gap-2.5 no-underline"
            onClick={(e) => { e.preventDefault(); document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' }); }}
          >
            <img src="/favicon.svg" alt="لوگوی رنکو" className="w-7 h-7" />
            <span className="text-[17px] font-black tracking-tight text-zinc-50">
              رنکو
            </span>
            <span className="mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md text-zinc-900" style={{ background: ACCENT }}>
              پرو
            </span>
          </a>

          <div className="hidden sm:flex items-center gap-1 text-[13px] font-bold text-zinc-400">
            <NavLink onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} label="ویژگی‌ها" />
            <NavLink onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} label="چطور کار می‌کند" />
            <a href="https://github.com/derhami/ranko" target="_blank" rel="noreferrer" className="no-underline text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg px-3 py-2">
              گیت‌هاب
            </a>
            <a href="#start" onClick={(e) => { e.preventDefault(); onOpenApp(); }} className="no-underline ml-1.5">
              <span className="rounded-xl px-4 py-2 text-zinc-950 font-black" style={{ background: `linear-gradient(120deg, ${ACCENT}, #ff7a4a)` }}>
                شروع آنالیز
              </span>
            </a>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="relative z-10">
        <Hero onStart={onStart} serverOk={serverOk} />
        <Features />
        <HowItWorks />
        <CTA onStart={onStart} onOpenApp={onOpenApp} serverOk={serverOk} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-zinc-500">
          <p className="flex items-center gap-1.5">
            <img src="/favicon.svg" alt="رنکو" className="w-4 h-4" />
            <span>
              رنکو — ابزار متن‌باز و رایگان سئو از{' '}
              <a href="https://nounproject.ir" target="_blank" rel="noreferrer" className="no-underline font-bold text-zinc-300 hover:text-[#ffb38e] transition-colors">
                لابراتوار درهمی
              </a>
            </span>
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/derhami/ranko" target="_blank" rel="noreferrer" className="no-underline text-zinc-500 hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5">
              <Icon d={I.github} className="w-3.5 h-3.5" />
              گیت‌هاب
            </a>
            <a href="https://www.npmjs.com/package/@seomator/seo-audit" target="_blank" rel="noreferrer" className="no-underline text-zinc-500 hover:text-zinc-200 transition-colors font-mono" dir="ltr">
              npm
            </a>
            <Icon d={I.sparkle} className="w-3.5 h-3.5 text-[#ff8d64]" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg px-3 py-2 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer bg-transparent border-0">
      {label}
    </button>
  );
}