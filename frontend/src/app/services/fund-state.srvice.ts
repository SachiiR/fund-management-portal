import { Injectable, signal } from '@angular/core';
import { Fund } from '../models/fund.model';

@Injectable({ providedIn: 'root' })
export class FundStateService {
  originalFund = signal<Fund | null>(null);
}