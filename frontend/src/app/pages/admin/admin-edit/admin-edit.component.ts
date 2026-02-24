import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FundsService } from '../../../services/funds.service';
import { Fund } from '../../../models/fund.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-admin-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-edit.component.html',
  styleUrls: ['./admin-edit.component.scss']
})
export class AdminEditComponent implements OnInit {
  fund: Fund | null = null;
  originalFund: Fund | null = null; // for cancel/discard
  loading = true;
  error: string | null = null;
  saving = false;

  private autoSaveSubject = new Subject<Partial<Fund>>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fundsService: FundsService
  ) {}

  ngOnInit(): void {
    const fundName = decodeURIComponent(this.route.snapshot.paramMap.get('name') || '');

    if (!fundName) {
      this.error = 'No fund name provided';
      this.loading = false;
      return;
    }

    this.fundsService.getFundByName(fundName).subscribe({
      next: (data) => {
        this.fund = { ...data };
        this.originalFund = { ...data }; // snapshot for cancel
        this.loading = false;
        this.setupAutoSave();
      },
      error: (err) => {
        this.error = err.message || 'Fund not found';
        this.loading = false;
      }
    });
  }

  private setupAutoSave(): void {
    this.autoSaveSubject.pipe(
      debounceTime(800),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe((updates) => {
      if (this.fund) {
        this.saveChanges(updates);
      }
    });
  }
  onArrayFieldChange(event: Event, field: 'strategies' | 'geographies' | 'managers'): void {
    const value = (event.target as HTMLInputElement).value;
    const parsed = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.onFieldChange(field, parsed);
  }

  onFieldChange<K extends keyof Fund>(field: K, value: Fund[K]): void {
    if (this.fund) {
      const updates = { [field]: value } as Pick<Fund, K>;
      this.fund = { ...this.fund, ...updates };
      this.autoSaveSubject.next(updates);
    }
  }

  private saveChanges(updates: Partial<Fund>): void {
    if (!this.fund) return;

    this.saving = true;
    this.fundsService.updateFund(this.fund.name, updates).subscribe({
      next: (updatedFund) => {
        this.fund = updatedFund;
        this.originalFund = { ...updatedFund };
        this.saving = false;
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.error = 'Failed to save changes';
        this.saving = false;
      }
    });
  }

  deleteFund(): void {
    if (!this.fund || !confirm(`Are you sure you want to delete "${this.fund.name}"?`)) {
      return;
    }

    this.fundsService.deleteFund(this.fund.name).subscribe({
      next: () => {
        alert('Fund deleted successfully');
        this.router.navigate(['/admin/funds']);
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.error = 'Failed to delete fund';
      }
    });
  }

  cancel(): void {
    if (this.originalFund) {
      this.fund = { ...this.originalFund };
    }
    this.router.navigate(['/admin/funds']);
  }
}