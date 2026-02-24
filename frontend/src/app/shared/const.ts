const BASE_URL = 'http://localhost:3000/api';
export const API_ENDPOINT = {
    FUND: `${BASE_URL}/funds`,
  } as const;

  // src/app/constants/fund-options.constants.ts
export const CURRENCIES = ['CAD', 'EUR', 'GBP', 'JPY', 'USD'];

export const STRATEGIES = [
  'Buyout',
  'Distressed Assets',
  'Growth Equity',
  'Hedge Fund',
  'Infrastructure',
  'Private Equity',
  'Real Estate',
  'Venture Capital'
];

export const GEOGRAPHIES = [
  'Africa',
  'Asia',
  'Europe',
  'Global',
  'Middle East',
  'North America',
  'Oceania',
  'South America'
];

export const MANAGERS = [
  'Alpha Capital',
  'Apex Ventures',
  'Blue Lake Fund',
  'Crescent Ventures',
  'Nova Fund',
  'Orion Equity',
  'Redwood Investments',
  'Silver Rock'
];