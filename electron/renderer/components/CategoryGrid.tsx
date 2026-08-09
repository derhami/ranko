/**
 * CSS grid of CategoryBar components for all audited categories.
 */

import type { CategoryResult } from '../../../src/types.js';
import { CategoryBar } from './CategoryBar.js';
import { CATEGORY_NAMES_FA } from '../lib/format.js';

interface CategoryGridProps {
  categories: CategoryResult[];
  activeCategory?: string | null;
  onCategoryClick?: (categoryId: string) => void;
}

export function CategoryGrid({ categories, activeCategory, onCategoryClick }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {categories.map((cat) => (
        <CategoryBar
          key={cat.categoryId}
          name={CATEGORY_NAMES_FA[cat.categoryId] ?? cat.categoryId}
          score={cat.score}
          passCount={cat.passCount}
          warnCount={cat.warnCount}
          failCount={cat.failCount}
          active={activeCategory === cat.categoryId}
          onClick={() => onCategoryClick?.(cat.categoryId)}
        />
      ))}
    </div>
  );
}
