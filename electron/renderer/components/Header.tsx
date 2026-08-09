/**
 * Fixed header with logo, audited URL info, and theme toggle.
 * Left padding accounts for macOS traffic light buttons.
 */

import { useTheme } from '../hooks/useTheme.js';
import { ConnectionStatus } from './ConnectionStatus.js';

interface HeaderProps {
  url?: string | null;
  crawledPages?: number;
  activeView: 'audit' | 'history';
  onViewChange: (view: 'audit' | 'history') => void;
}

export function Header({ url, crawledPages, activeView, onViewChange }: HeaderProps) {
  const { theme, toggle } = useTheme();

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[var(--header-height)] bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] z-50 drag-region px-4"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="https://seo.nounproject.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 no-drag group hover:opacity-95 transition-opacity no-underline"
            title="رنکو پرو — سامانه هوشمند ممیزی سئو"
          >
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              <img src="/favicon.svg" alt="لوگوی رنکو پرو" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight" style={{ color: 'var(--color-text)' }}>
                رنکو
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-indigo-600 to-blue-600 text-white tracking-wider">
                پرو
              </span>
            </div>
          </a>
        </div>

        {/* Separator */}
        <div className="w-px h-5 shrink-0" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Nav tabs */}
        <nav className="flex gap-1 no-drag shrink-0">
          <NavTab
            label="تحلیل سئو"
            active={activeView === 'audit'}
            onClick={() => onViewChange('audit')}
          />
          <NavTab
            label="تاریخچه ممیزی‌ها"
            active={activeView === 'history'}
            onClick={() => onViewChange('history')}
          />
        </nav>

        {/* URL info */}
        <div className="flex-1 flex items-center gap-2.5 min-w-0 no-drag">
          {url && (
            <>
              <span
                className="text-xs truncate font-mono"
                style={{ color: 'var(--color-text-muted)' }}
                title={url}
              >
                {url}
              </span>
              {crawledPages != null && crawledPages > 1 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                  style={{
                    backgroundColor: 'var(--color-info-bg)',
                    color: 'var(--color-info)',
                  }}
                >
                  {crawledPages} صفحه
                </span>
              )}
            </>
          )}
        </div>

        {/* Connection Status indicator */}
        <div className="no-drag">
          <ConnectionStatus />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="no-drag w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--color-bg-hover)] transition-colors shrink-0"
          title={`تغییر به حالت ${theme === 'light' ? 'تاریک' : 'روشن'}`}
        >
          <span className="text-base">{theme === 'light' ? '\u263E' : '\u2600'}</span>
        </button>
      </div>
    </header>
  );
}

function NavTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-[var(--color-accent-light)]'
          : 'hover:bg-[var(--color-bg-hover)]'
      }`}
      style={{
        color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
      }}
    >
      {label}
    </button>
  );
}
