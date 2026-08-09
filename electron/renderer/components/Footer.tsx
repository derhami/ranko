/**
 * Ultra-compact footer with copyright notice and dofollow backlink to derhami.com
 */

export function Footer() {
  return (
    <footer className="mt-8 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-center text-[11px]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
        <p className="flex items-center gap-1">
          <span>طراحی و توسعه با</span>
          <span className="text-red-500 inline-block text-[10px]">❤️</span>
          <span>توسط</span>
          <a
            href="https://derhami.com"
            target="_blank"
            rel="dofollow"
            className="font-semibold hover:text-[var(--color-accent)] transition-colors no-underline"
            style={{ color: 'var(--color-accent)' }}
          >
            حمیدرضا درهمی
          </a>
        </p>
        <p className="flex items-center gap-1.5 font-mono text-[10px]">
          <span>© رنکو پرو — تمامی حقوق محفوظ است</span>
        </p>
      </div>
    </footer>
  );
}


