import { Fund } from '../models/fund.model';

export interface AppState {
  funds: FundsState;
  auth: AuthState;
}

export interface FundsState {
  funds: Fund[];
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  isAdmin: boolean;
  token: string | null;
}