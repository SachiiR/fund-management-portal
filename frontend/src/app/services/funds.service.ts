import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from '../shared/const';
import { Fund } from '../models/fund.model';

@Injectable({
  providedIn: 'root'
})
export class FundsService {
    constructor(private http: HttpClient) {}

    getAllFunds(): Observable<Fund[]> {
      console.log('hit the srvice')
      return this.http.get<Fund[]>(`${API_ENDPOINT.FUND}`);
    }
  
    getFundByName(name: string): Observable<Fund> {
      return this.http.get<Fund>(`${API_ENDPOINT.FUND}/${name.trim()}`);
    }
  
    updateFund(name: string, data: Partial<Fund>): Observable<Fund> {
      return this.http.put<Fund>(`${API_ENDPOINT.FUND}/${name.trim()}`, data);
    }
  
    deleteFund(name: string): Observable<{ message: string }> {
      return this.http.delete<{ message: string }>(`${API_ENDPOINT.FUND}/${name}`);
    }
}
