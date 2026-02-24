import { Fund } from '../models/fund.model';
import { FundFilters } from '../models/fund-filters.model';
import { FundSortKey, SortDirection } from './types';

export function filterFunds(funds: Fund[], filters: FundFilters): Fund[] {
  return funds.filter(f => {
    // Name (free text search)
    if (filters.name?.trim()) {
      if (!f.name.toLowerCase().includes(filters.name.toLowerCase().trim())) {
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
    if (filters.currency?.trim() && f.currency !== filters.currency.trim()) {
      return false;
    }

    // Numeric ranges – skip if empty/invalid
    const minSize = filters.fundSizeMin?.trim() ? parseFloat(filters.fundSizeMin.trim()) : NaN;
    if (!isNaN(minSize) && f.fundSize < minSize) return false;

    const maxSize = filters.fundSizeMax?.trim() ? parseFloat(filters.fundSizeMax.trim()) : NaN;
    if (!isNaN(maxSize) && f.fundSize > maxSize) return false;

    const minVintage = filters.vintageMin?.trim() ? parseInt(filters.vintageMin.trim(), 10) : NaN;
    if (!isNaN(minVintage) && f.vintage < minVintage) return false;

    const maxVintage = filters.vintageMax?.trim() ? parseInt(filters.vintageMax.trim(), 10) : NaN;
    if (!isNaN(maxVintage) && f.vintage > maxVintage) return false;

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
    vintageMax: ''
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