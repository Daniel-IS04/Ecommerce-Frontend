import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
@Injectable({
  providedIn: 'root',
})
export class BaseHttp {
  public http = inject(HttpClient);
  public apiDJ = environment.apiDJ;
}
