import { Fund } from '../models/fund.model';

export interface AppState {
  funds: FundsState;
}

export interface FundsState {
  selectedFund: Fund;
}

export const initialFundsState: FundsState = {
  selectedFund: {
    name: '',
    strategies: [],
    geographies: [],
    currency: '',
    managers: [],
    fundSize: 0,
    description: '',
    vintage: 0
  }
}