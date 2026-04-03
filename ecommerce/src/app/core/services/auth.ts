import { Injectable, signal, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { catchError, tap, finalize } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // Importamos la librería
import { Router } from '@angular/router';
// Asegúrate de que tus interfaces coincidan con la nueva respuesta
import {
  RegisterPayload,
  RegisterResponse,
  RegisterErrorResponse,
  LoginPayload,
  LoginResponse,
} from '../models/auth';

// Interfaz para tipar lo que viene dentro del token de Django
export interface DecodedToken {
  user_id: number;
  first_name: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}
export interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly apiDJ = environment.apiDJ;

  // Signals para manejar la reactividad en toda la app
  isLoggedIn = signal<boolean>(this.checkToken());
  currentUser = signal<DecodedToken | null>(this.getUserFromToken());
  constructor(
    private http: HttpClient,
    private router: Router, // <--- Solución aquí
  ) {}

  private checkToken(): boolean {
    if (typeof window !== 'undefined' && localStorage) {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }

  private getUserFromToken(): DecodedToken | null {
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          return jwtDecode<DecodedToken>(token);
        } catch (error) {
          return null;
        }
      }
    }
    return null;
  }

  register(data: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiDJ}/users/register/`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 && error.error) {
          const backendError = error.error as RegisterErrorResponse;
          console.error('Errores de validación de DRF:', backendError.errors);
        }
        return throwError(() => error);
      }),
    );
  }

  login(data: LoginPayload): Observable<LoginResponse> {
    // 1. EL TRUCO: Transformamos el payload para que Django esté feliz
    const djangoPayload = {
      username: data.email, // Mapeamos tu campo 'email' al 'username' que exige Django
      password: data.password,
    };

    // 2. Enviamos el djangoPayload en lugar del data original
    return this.http
      .post<LoginResponse>(`${this.apiDJ}/users/login/`, djangoPayload, { withCredentials: true })
      .pipe(
        tap((response: LoginResponse) => {
          localStorage.setItem('access_token', response.token);
          const decoded = jwtDecode<DecodedToken>(response.token);
          this.currentUser.set(decoded);
          this.isLoggedIn.set(true);
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Ocurrió un error desconocido.';
          if (error.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
          } else if (error.status === 400 || error.status === 401) {
            errorMessage = 'Correo o contraseña incorrectos.';
          } else if (error.status >= 500) {
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
          }
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  logout() {
    // Le pegamos al backend para que haga el .delete() en la base de datos
    // Usamos withCredentials para que Angular envíe la cookie del refresh
    this.http
      .post(`${this.apiDJ}/users/logout/`, {}, { withCredentials: true })
      .pipe(
        // Finalize se ejecuta SIEMPRE, ya sea que el backend responda 200 o de error
        finalize(() => {
          localStorage.removeItem('access_token');
          this.isLoggedIn.set(false);
          this.currentUser.set(null);
          this.router.navigate(['/auth/login']); // Usas this.router
        }),
      )
      .subscribe();
  }
  refreshToken(): Observable<{ token: string }> {
    // Va al backend con la cookie a pedir un nuevo access_token
    return this.http
      .post<{ token: string }>(`${this.apiDJ}/users/refresh/`, {}, { withCredentials: true })
      .pipe(
        tap((response) => {
          // Actualizamos la memoria silenciosamente
          localStorage.setItem('access_token', response.token);
          const decoded = jwtDecode<DecodedToken>(response.token);
          this.currentUser.set(decoded);
        }),
      );
  }
  Profile(): Observable<ProfileData> {
    return this.http.get<ProfileData>(`${this.apiDJ}/users/me/`);
  }
  UpdateProfile(data: Partial<ProfileData>) {
    return this.http.patch<ProfileData>(`${this.apiDJ}/users/me/`, data);
  }
}
