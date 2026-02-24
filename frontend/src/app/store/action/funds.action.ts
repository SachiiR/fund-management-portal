import {  createAction, props } from '@ngrx/store';
import { Fund } from '../../models/fund.model';

export const setSelectedFund = createAction(
  '[Fund] Set Selected Fund',
  props<{ fund: Fund }>()
);

