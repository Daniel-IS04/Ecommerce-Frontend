import { Injectable, signal } from '@angular/core';
import { BaseHttp } from './base-http';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { catchError, tap } from 'rxjs/operators';
import { RegisterPayload, RegisterResponse, RegisterErrorResponse } from '../models/auth';
import { LoginPayload, LoginResponse, LoginErrorResponse } from '../models/auth';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly apiDJ = environment.apiDJ;
  isLoggedIn = signal<boolean>(this.checkToken());
  constructor(private http: HttpClient) {}
  private checkToken(): boolean {
    // Verificamos si estamos en el navegador para evitar errores con SSR (Server-Side Rendering)
    if (typeof window !== 'undefined' && localStorage) {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }
  register(data: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiDJ}/users/register/`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 && error.error) {
          const backendError = error.error as RegisterErrorResponse;
          // Aquí capturas el diccionario exacto de errores para pintar en tu formulario reactivo
          console.error('Errores de validación de DRF:', backendError.errors);
        }
        return throwError(() => error);
      }),
    );
  }

  login(data: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiDJ}/users/login/`, data).pipe(
      // TAP: Ejecuta una acción secundaria si la petición HTTP fue exitosa (código 200)
      tap((response: any) => {
        // Asumiendo que Django te devuelve 'access' y 'refresh' en el JSON
        console.log('--- ENTRANDO AL TAP DE LOGIN EN EL SERVICIO ---', response);
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);

        // Notificamos a toda la app que ya hay sesión
        this.isLoggedIn.set(true);
      }),
      catchError((error: HttpErrorResponse) => {
        console.log('--- SIGNAL isLoggedIn ESTABLECIDO EN TRUE ---');
        // ... (Todo tu excelente bloque de manejo de errores se mantiene intacto aquí) ...
        let errorMessage = 'Ocurrió un error desconocido.';
        if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else if (error.status === 400 || error.status === 401) {
          if (error.error && error.error.non_field_errors) {
            errorMessage = error.error.non_field_errors[0];
          } else if (error.error && error.error.detail) {
            errorMessage = error.error.detail;
          } else {
            errorMessage = 'Correo o contraseña incorrectos.';
          }
        } else if (error.status >= 500) {
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isLoggedIn.set(false);
  }
}
