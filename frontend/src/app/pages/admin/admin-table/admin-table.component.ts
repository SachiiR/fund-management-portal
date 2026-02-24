import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FundsService } from '../../../services/funds.service';
import { Fund } from '../../../models/fund.model';
import { FundFilters } from '../../../models/fund-filters.model';
import { emptyFilters, filterFunds, formatFundSize } from '../../../shared/fund.util';
import { CURRENCIES, GEOGRAPHIES, MANAGERS, STRATEGIES } from './../../../shared/const';

@Component({
  selector: 'app-admin-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-table.component.html',
  styleUrls: ['./admin-table.component.scss']
})
export class AdminTableComponent implements OnInit {
  funds = signal<Fund[]>([]);                    
  filteredFunds = signal<Fund[]>([]);            

  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  sortColumn = signal<keyof Fund | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  loading = signal(true);
  error = signal('');
  filters: FundFilters = emptyFilters();
  displayedColumns = ['name', 'strategies', 'geographies', 'currency', 'fundSize', 'vintage', 'managers', 'actions'];
  openDropdown: string | null = null;

  currencies = CURRENCIES;
  strategies = STRATEGIES;
  geographies = GEOGRAPHIES;
  managers = MANAGERS;

  constructor(
    private fundsService: FundsService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.loadFunds();
  }

  toggleDropdown(name: string): void {
    this.openDropdown = this.openDropdown === name ? null : name;
  }
  
  toggleArrayFilter(field: 'strategies' | 'geographies' | 'managers', value: string): void {
    const current = this.filters[field];
    const index = current.indexOf(value);
    if (index > -1) {
      this.filters[field] = current.filter(v => v !== value);
    } else {
      this.filters[field] = [...current, value];
    }
    this.applyFilters();
  }
  
  @HostListener('document:click')
  closeDropdowns(): void {
    this.openDropdown = null;
  }

  get activeFilterCount(): number {
    return Object.values(this.filters).filter(v => 
      Array.isArray(v) ? v.length > 0 : !!v
    ).length;
  }


  private loadFunds() {
    this.loading.set(true);
    this.fundsService.getAllFunds().subscribe({
      next: (data) => {
        this.funds.set(data);
        this.applyFiltersAndSort(); // initial apply
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load funds. Ensure the backend is running.');
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    console.log('fundSizeMin:', this.filters.fundSizeMin, typeof this.filters.fundSizeMin);
      console.log('fundSizeMax:', this.filters.fundSizeMax, typeof this.filters.fundSizeMax);
    this.applyFiltersAndSort();
  }

  clearFilters(): void {
    this.filters = emptyFilters();
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort() {
    let result = filterFunds(this.funds(), this.filters);

    // Apply sorting
    if (this.sortColumn()) {
      result = this.sortFunds(result, this.sortColumn()!, this.sortDirection());
    }

    this.filteredFunds.set(result);
    this.updatePagination();
  }

  sort(column: keyof Fund): void {
    if (this.sortColumn() === column) {
      // toggle direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.applyFiltersAndSort();
  }
  

  // private sortFunds(data: Fund[], column: keyof Fund, direction: 'asc' | 'desc'): Fund[] {
  //   return [...data].sort((a, b) => {
  //     const valA = a[column];
  //     const valB = b[column];

  //     let comparison = 0;

  //     if (Array.isArray(valA) && Array.isArray(valB)) {
  //       comparison = valA.join(',').localeCompare(valB.join(','));
  //     } else if (typeof valA === 'number' && typeof valB === 'number') {
  //       comparison = valA - valB;
  //     } else {
  //       comparison = String(valA ?? '').localeCompare(String(valB ?? ''));
  //     }

  //     return direction === 'asc' ? comparison : -comparison;
  //   });
  // }

  private sortFunds(data: Fund[], column: keyof Fund, direction: 'asc' | 'desc'): Fund[] {
    return [...data].sort((a, b) => {
      let valA = a[column];
      let valB = b[column];
  
      // Handle arrays (e.g. strategies, geographies, managers)
      if (Array.isArray(valA) && Array.isArray(valB)) {
        // Sort by length first
        if (valA.length !== valB.length) {
          return direction === 'asc' 
            ? valA.length - valB.length 
            : valB.length - valA.length;
        }
        // Then by joined string
        valA = valA.join(', ').toLowerCase();
        valB = valB.join(', ').toLowerCase();
      }
  
      // Handle numbers (fundSize, vintage)
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
  
      // Default: string comparison
      const strA = String(valA ?? '').toLowerCase();
      const strB = String(valB ?? '').toLowerCase();
  
      if (strA < strB) return direction === 'asc' ? -1 : 1;
      if (strA > strB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private updatePagination() {
    const total = this.filteredFunds().length;
    this.totalPages.set(Math.ceil(total / this.pageSize()));
    // Clamp current page if needed
    if (this.currentPage() >= this.totalPages()) {
      this.currentPage.set(Math.max(0, this.totalPages() - 1));
    }
  }

  get paginatedFunds(): Fund[] {
    const start = this.currentPage() * this.pageSize();
    return this.filteredFunds().slice(start, start + this.pageSize());
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
    }
  }


  goToFund(name: string): void {
    this.router.navigate(['/user/view', encodeURIComponent(name)]);
  }

  goToEdit(name: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/admin/view/edit', encodeURIComponent(name)]);
  }

  formatSize(n: number): string {
    return formatFundSize(n);
  }
}