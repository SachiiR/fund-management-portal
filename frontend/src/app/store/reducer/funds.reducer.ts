
import { createReducer, on } from '@ngrx/store';
import { initialFundsState } from '../app.state'
import { setSelectedFund } from '../action/funds.action';

export const fundsReducer = createReducer(
    initialFundsState,
    on(setSelectedFund, (state, { fund }) => ({ ...state, selectedFund: fund })),
);