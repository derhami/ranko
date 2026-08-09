/**
 * Left sidebar with category navigation and count badges.
 */

import type { CategoryResult } from '../../../src/types.js';
import { getScoreColor, CATEGORY_NAMES_FA } from '../lib/format.js';

interface SidebarProps {
  categories: CategoryResult[];
  activeCategory?: string | null;
  onCategoryClick: (categoryId: string) => void;
}

export function Sidebar({ categories, activeCategory, onCategoryClick }: SidebarProps) {
  return (
    <aside
      className="fixed right-0 top-[var(--header-height)] bottom-0 w-[var(--sidebar-width)] border-l border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-y-auto p-3 z-40"
    >
      <div className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: 'var(--color-text-muted)' }}>
        دسته‌بندی‌های سئو
      </div>
      <nav className="space-y-0.5">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.categoryId;
          const color = getScoreColor(cat.score);
          const issueCount = cat.failCount + cat.warnCount;
          return (
            <button
              key={cat.categoryId}
              onClick={() => onCategoryClick(cat.categoryId)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--color-accent-light)] font-medium'
                  : 'hover:bg-[var(--color-bg-hover)]'
              }`}
              style={{
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
            >
              <span className="truncate">{CATEGORY_NAMES_FA[cat.categoryId] ?? cat.categoryId}</span>
              <div className="flex items-center gap-2 mr-2 shrink-0">
                {issueCount > 0 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      color: cat.failCount > 0 ? 'var(--color-fail)' : 'var(--color-warn)',
                      backgroundColor: cat.failCount > 0 ? 'var(--color-fail-bg)' : 'var(--color-warn-bg)',
                    }}
                  >
                    {issueCount}
                  </span>
                )}
                <span
                  className="text-xs font-bold"
                  style={{ color }}
                >
                  {Math.round(cat.score)}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
