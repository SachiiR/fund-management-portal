// models/fund-filters.model.ts
export interface FundFilters {
    name: string;
    strategies: string[];     // ← changed
    geographies: string[];
    currency: string;
    managers: string[];
    fundSizeMin: string;      // keep string if input is <input type="text"> or number input → parse later
    fundSizeMax: string;
    vintageMin: string;
    vintageMax: string;
  }