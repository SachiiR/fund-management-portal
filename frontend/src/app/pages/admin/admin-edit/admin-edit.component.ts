import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FundsService } from '../../../services/funds.service';
import { Fund } from '../../../models/fund.model';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { setSelectedFund } from './../../../store/action/funds.action';
import { selectCurrentFund } from './../../../store/selector/funds.selector';
import { CURRENCIES, STRATEGIES, GEOGRAPHIES, MANAGERS } from '../../../shared/const';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-admin-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-edit.component.html',
  styleUrls: ['./admin-edit.component.scss']
})
export class AdminEditComponent implements OnInit {
  fund: Fund | null = null;
  loading = true;
  error: string | null = null;
  saving = false;
  openDropdown: 'strategies' | 'geographies' | 'managers' | null = null;

  originalFund$: Observable<Fund>;

  currencies = CURRENCIES;
  strategies = STRATEGIES;
  geographies = GEOGRAPHIES;
  managers = MANAGERS;

  @ViewChild('deleteModal') deleteModal!: TemplateRef<any>;

  private autoSaveSubject = new Subject<Partial<Fund>>();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private fundsService: FundsService,
    private modalService: NgbModal
  ) {
    this.originalFund$ = this.store.select(selectCurrentFund);
  }

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
        this.store.dispatch(setSelectedFund({ fund: data }));
        this.loading = false;
        this.setupAutoSave();
      },
      error: (err) => {
        this.error = err.message || 'Fund not found';
        this.loading = false;
      }
    });
  }

  // ── Dropdown ────────────────────────────────────────
  toggleDropdown(field: 'strategies' | 'geographies' | 'managers'): void {
    this.openDropdown = this.openDropdown === field ? null : field;
  }

  onOutsideClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.filter-dropdown')) {
      this.openDropdown = null;
    }
  }

  toggleItem(field: 'strategies' | 'geographies' | 'managers', item: string): void {
    if (this.fund) {
      const current = [...(this.fund[field] as string[])];
      const index = current.indexOf(item);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(item);
      }
      this.onFieldChange(field, current);
    }
  }

  // ── Field Changes ───────────────────────────────────
  onFieldChange<K extends keyof Fund>(field: K, value: Fund[K]): void {
    if (this.fund) {
      const updates = { [field]: value } as Pick<Fund, K>;
      this.fund = { ...this.fund, ...updates };
      this.autoSaveSubject.next(updates);
    }
  }

  // ── Autosave ────────────────────────────────────────
  private setupAutoSave(): void {
    this.autoSaveSubject.pipe(
      debounceTime(800),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe((updates) => {
      if (this.fund) this.saveChanges(updates);
    });
  }

  private saveChanges(updates: Partial<Fund>): void {
    if (!this.fund) return;
    this.saving = true;
    this.fundsService.updateFund(this.fund.name, updates).subscribe({
      next: (updatedFund) => {
        this.fund = updatedFund;
        this.saving = false;
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.error = 'Failed to save changes';
        this.saving = false;
      }
    });
  }

  // ── Navigation ──────────────────────────────────────
  saveAndGoBack(): void {
    this.router.navigate(['/admin/funds']);
  }

  cancel(): void {
    this.originalFund$.pipe(take(1)).subscribe(original => {
      if (original) {
        this.fundsService.updateFund(original.name, original).subscribe({
          next: () => this.router.navigate(['/admin/funds']),
          error: () => this.router.navigate(['/admin/funds'])
        });
      } else {
        this.router.navigate(['/admin/funds']);
      }
    });
  }

  // deleteFund(): void {
  //   if (!this.fund || !confirm(`Are you sure you want to delete "${this.fund.name}"?`)) return;
  //   this.fundsService.deleteFund(this.fund.name).subscribe({
  //     next: () => {
  //       alert('Fund deleted successfully');
  //       this.router.navigate(['/admin/funds']);
  //     },
  //     error: (err) => {
  //       console.error('Delete failed:', err);
  //       this.error = 'Failed to delete fund';
  //     }
  //   });
  // }
  openDeleteModal(content: TemplateRef<any>): void {
    this.modalService.open(content, { centered: true, backdrop: 'static' })
      .result.then(result => {
        if (result === 'confirm') {
          this.deleteFund();
        }
      }).catch(() => {}); // dismissed
  }

  deleteFund(): void {
    if (!this.fund) return;
    this.fundsService.deleteFund(this.fund.name).subscribe({
      next: () => {
        this.router.navigate(['/admin/funds']);
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.error = 'Failed to delete fund';
      }
    });
  }
  
}