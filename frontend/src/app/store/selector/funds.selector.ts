import { createSelector, createFeatureSelector } from '@ngrx/store';
import { FundsState } from '../app.state';

export const selectFundState = createFeatureSelector<FundsState>('funds');
export const selectCurrentFund = createSelector(selectFundState, s => s.selectedFund);
