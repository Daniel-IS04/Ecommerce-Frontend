import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development'; // Verifica que los '../' lleguen a la carpeta environments

@Injectable({
  providedIn: 'root',
})
export class BaseHttp {
  // Al usar 'protected', le decimos que solo esta clase y sus HIJOS pueden usar estas variables
  protected http = inject(HttpClient);
  protected apiUrl = environment.apiUrl;
}
