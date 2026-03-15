import { Injectable } from '@angular/core';
import { BaseHttp } from './base-http'; // Importamos al Padre
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth extends BaseHttp {
  // Heredamos de BaseHttp

  // 1. Endpoint: Registro
  register(userData: any): Observable<any> {
    // Usamos this.http y this.apiUrl que heredamos mágicamente
    return this.http.post(`${this.apiUrl}/users/register/`, userData);
  }

  // 2. Endpoint: Login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login/`, credentials);
  }

  // 3. Endpoint: Perfil del usuario (Requiere token, luego veremos eso)
  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me/`);
  }
}
