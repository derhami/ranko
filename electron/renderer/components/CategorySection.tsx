/**
 * Collapsible section for a single category's rule results.
 */

import { useState } from 'react';
import type { CategoryResult } from '../../../src/types.js';
import type { RuleMetadataIpc } from '../../shared/ipc-types.js';
import { getScoreColor, CATEGORY_NAMES_FA } from '../lib/format.js';
import { RuleCard } from './RuleCard.js';
import type { FilterStatus } from './FilterTabs.js';

interface CategorySectionProps {
  category: CategoryResult;
  filter: FilterStatus;
  ruleMetadata?: Record<string, RuleMetadataIpc>;
  defaultExpanded?: boolean;
  searchQuery?: string;
}

export function CategorySection({ category, filter, ruleMetadata, defaultExpanded = false, searchQuery = '' }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const color = getScoreColor(category.score);
  const name = CATEGORY_NAMES_FA[category.categoryId] ?? category.categoryId;

  const query = searchQuery.trim().toLowerCase();

  const filteredRules = category.results.filter((r) => {
    // Filter by status tab
    if (filter !== 'all' && r.status !== filter) return false;
    
    // Filter by search query if present
    if (query) {
      const meta = ruleMetadata?.[r.ruleId];
      const matchName = meta?.name?.toLowerCase().includes(query);
      const matchDesc = meta?.description?.toLowerCase().includes(query);
      const matchMsg = r.message?.toLowerCase().includes(query);
      const matchId = r.ruleId.toLowerCase().includes(query);
      return matchName || matchDesc || matchMsg || matchId;
    }
    return true;
  });

  // Deduplicate rules by ruleId (keep worst status for multi-page audits)
  const uniqueRules = Array.from(
    filteredRules
      .reduce((map, rule) => {
        const existing = map.get(rule.ruleId);
        if (!existing || rule.score < existing.score) {
          map.set(rule.ruleId, rule);
        }
        return map;
      }, new Map<string, typeof filteredRules[0]>())
      .values(),
  );

  if (uniqueRules.length === 0) return null;

  const isExpanded = expanded || defaultExpanded || Boolean(query);

  return (
    <section id={`category-${category.categoryId}`} className="mb-4">
      <button
        onClick={() => setExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {isExpanded ? '\u25BC' : '\u25C4'}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {name}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ color, backgroundColor: `${color}15` }}
          >
            {Math.round(category.score)}
          </span>
        </div>
        <div className="flex gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {category.failCount > 0 && (
            <span style={{ color: 'var(--color-fail)' }}>{category.failCount} خطا</span>
          )}
          {category.warnCount > 0 && (
            <span style={{ color: 'var(--color-warn)' }}>{category.warnCount} هشدار</span>
          )}
          <span style={{ color: 'var(--color-pass)' }}>{category.passCount} پاس</span>
        </div>
      </button>

      {isExpanded && (
        <div className="mr-6 mt-1 space-y-2">
          {uniqueRules.map((rule) => (
            <RuleCard key={rule.ruleId} rule={rule} metadata={ruleMetadata?.[rule.ruleId]} />
          ))}
        </div>
      )}
    </section>
  );
}
