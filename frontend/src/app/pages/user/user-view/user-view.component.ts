import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FundsService } from '../../../services/funds.service';
import { Fund } from '../../../models/fund.model';
import { formatFundSize } from '../../../shared/fund.util';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss']
})
export class UserViewComponent implements OnInit {
  fund: Fund | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fundsService: FundsService
  ) {}

  ngOnInit(): void {
    const fundName = this.route.snapshot.paramMap.get('name');

    if (!fundName) {
      this.error = 'No fund name provided in the URL';
      this.loading = false;
      return;
    }

    const decodedName = decodeURIComponent(fundName);

    this.fundsService.getFundByName(decodedName).subscribe({
      next: (data) => {
        this.fund = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Fund not found or server error';
        this.loading = false;
      }
    });
  }

  formatSize(size: number): string {
    return formatFundSize(size);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}