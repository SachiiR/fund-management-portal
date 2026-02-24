import { Fund } from '../models/fund.model';
import { FundFilters } from '../models/fund-filters.model';
import { FundSortKey, SortDirection } from './types';

export function filterFunds(funds: Fund[], filters: FundFilters): Fund[] {
  return funds.filter(f => {

    if (filters.search?.trim()) {
      const term = filters.search.toLowerCase().trim();
      const matches =
        f.name.toLowerCase().includes(term) ||
        f.strategies.some(s => s.toLowerCase().includes(term)) ||
        f.geographies.some(g => g.toLowerCase().includes(term)) ||
        f.managers.some(m => m.toLowerCase().includes(term)) ||
        f.description.toLowerCase().includes(term) ||
        f.currency.toLowerCase().includes(term);
      if (!matches) return false;
    }
    // Name (free text search)
    if (filters.name?.trim()) {
      if (!f.name.toLowerCase().includes(filters.name.toLowerCase().trim())) {
        return false;
      }
    }

    if (filters.description?.trim()) {
      if (!f.description?.toLowerCase().includes(filters.description.toLowerCase().trim())) {
        return false;
      }
    }

    // Multi-value fields – ANY match (common for multi-select filters)
    if (filters.strategies?.length) {
      if (!filters.strategies.some(s => f.strategies.includes(s))) return false;
    }

    if (filters.geographies?.length) {
      if (!filters.geographies.some(g => f.geographies.includes(g))) return false;
    }

    if (filters.managers?.length) {
      if (!filters.managers.some(m => f.managers.includes(m))) return false;
    }

    // Single value
    if (filters.currency && f.currency !== filters.currency) {
      return false;
    }

// Fund Size (min/max as numbers, ignore if empty or invalid)
const size = f.fundSize;
const minSize = filters.fundSizeMin ? parseFloat(filters.fundSizeMin) : null;
const maxSize = filters.fundSizeMax ? parseFloat(filters.fundSizeMax) : null;

if (minSize !== null && (isNaN(minSize) || size < minSize)) {
  return false;
}
if (maxSize !== null && (isNaN(maxSize) || size > maxSize)) {
  return false;
}

// Vintage (min/max as numbers, ignore if empty or invalid)
const vintage = f.vintage;
const minVintage = filters.vintageMin ? parseInt(filters.vintageMin, 10) : null;
const maxVintage = filters.vintageMax ? parseInt(filters.vintageMax, 10) : null;

if (minVintage !== null && (isNaN(minVintage) || vintage < minVintage)) {
  return false;
}
if (maxVintage !== null && (isNaN(maxVintage) || vintage > maxVintage)) {
  return false;
}

    return true;
  });
}

export function sortFunds(
  funds: Fund[],
  col: FundSortKey,
  dir: SortDirection = 'asc'
): Fund[] {
  // We return new array → immutable sort
  return [...funds].sort((a, b) => {
    const av = a[col];
    const bv = b[col];

    let cmp = 0;

    if (Array.isArray(av) && Array.isArray(bv)) {
      // Sort arrays by joined string (simple but readable)
      cmp = av.join(', ').localeCompare(bv.join(', '));
    } else if (typeof av === 'number' && typeof bv === 'number') {
      cmp = av - bv;
    } else {
      // fallback: string conversion
      cmp = String(av ?? '').localeCompare(String(bv ?? ''));
    }

    return dir === 'asc' ? cmp : -cmp;
  });
}

export function formatFundSize(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}B`;
  }
  if (n >= 1) {
    return `${n.toFixed(1)}M`;
  }
  return `${n.toFixed(2)}M`; // small funds
}

export function emptyFilters(): FundFilters {
  return {
    name: '',
    strategies: [],
    geographies: [],
    currency: '',
    managers: [],
    fundSizeMin: '',
    fundSizeMax: '',
    vintageMin: '',
    vintageMax: '',
    search: '',
    description: '',
  };
}

// Optional helper if you want to support comma-separated input in text fields
export function parseArrayField(text: string): string[] {
  if (!text?.trim()) return [];
  return text
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}